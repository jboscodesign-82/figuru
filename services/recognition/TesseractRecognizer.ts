import { createWorker, PSM, Worker } from 'tesseract.js';
import { IStickerRecognizer, DetectedSticker, BoundingBox } from '@/types';
import albumData from '@/assets/data/stickers.json';

// ─── Lookup tables built once at module load ────────────────────────────────

interface StickerMeta {
  id: string;
  number: number;
  playerName: string;
  country: string;
}

const byNumber = new Map<number, StickerMeta>();
// last name (normalized) → list of stickers (multiple players may share last name)
const byLastName = new Map<string, StickerMeta[]>();

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

albumData.pages.forEach((p) =>
  p.countries.forEach((c) =>
    c.stickers.forEach((s) => {
      const meta: StickerMeta = {
        id: s.id,
        number: s.number,
        playerName: s.playerName,
        country: c.code,
      };
      byNumber.set(s.number, meta);

      // Index by each word in the player name (catches last names and first names)
      s.playerName.split(/\s+/).forEach((word) => {
        if (word.length < 3) return;
        const key = normalize(word);
        if (!byLastName.has(key)) byLastName.set(key, []);
        byLastName.get(key)!.push(meta);
      });
    })
  )
);

// ─── Word cluster helpers ───────────────────────────────────────────────────

interface Word {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/** Group words into clusters where each cluster belongs to one sticker card.
 *  Uses a simple single-linkage: two words are in the same cluster if their
 *  vertical centres are within `gapThreshold` of each other AND their
 *  horizontal ranges overlap or are close. */
function clusterWords(words: Word[], imgW: number, imgH: number): Word[][] {
  const gap = imgH * 0.18; // words within 18% of image height → same card
  const clusters: Word[][] = [];

  for (const word of words) {
    const wCy = (word.bbox.y0 + word.bbox.y1) / 2;
    const wCx = (word.bbox.x0 + word.bbox.x1) / 2;

    let placed = false;
    for (const cluster of clusters) {
      for (const cw of cluster) {
        const cCy = (cw.bbox.y0 + cw.bbox.y1) / 2;
        const cCx = (cw.bbox.x0 + cw.bbox.x1) / 2;
        if (Math.abs(wCy - cCy) < gap && Math.abs(wCx - cCx) < imgW * 0.25) {
          cluster.push(word);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) clusters.push([word]);
  }

  return clusters;
}

/** Try to find a sticker from a cluster of words.
 *  Strategy: look for a 1-3 digit number first, then find a name match. */
function matchCluster(
  cluster: Word[],
  imgW: number,
  imgH: number
): StickerMeta | null {
  let numberMatch: StickerMeta | null = null;
  let nameMatch: StickerMeta | null = null;

  for (const word of cluster) {
    const clean = word.text.replace(/[^0-9]/g, '');
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num >= 1 && num <= 980 && byNumber.has(num)) {
      numberMatch = byNumber.get(num)!;
    }
  }

  // Try name matching against every word
  for (const word of cluster) {
    const key = normalize(word.text);
    if (key.length < 3) continue;
    const candidates = byLastName.get(key);
    if (candidates) {
      // Prefer the candidate whose number matches the number we found
      if (numberMatch) {
        const exact = candidates.find((c) => c.id === numberMatch!.id);
        if (exact) { nameMatch = exact; break; }
      }
      nameMatch = candidates[0];
    }
  }

  // Return best match: number wins, name used to confirm
  if (numberMatch && nameMatch && numberMatch.id === nameMatch.id) return numberMatch;
  if (numberMatch) return numberMatch;
  if (nameMatch) return nameMatch;
  return null;
}

function clusterBBox(cluster: Word[], imgW: number, imgH: number): BoundingBox {
  const x0 = Math.min(...cluster.map((w) => w.bbox.x0));
  const y0 = Math.min(...cluster.map((w) => w.bbox.y0));
  const x1 = Math.max(...cluster.map((w) => w.bbox.x1));
  const y1 = Math.max(...cluster.map((w) => w.bbox.y1));
  // Add some padding
  const pad = imgH * 0.05;
  return {
    x: Math.max(0, (x0 - pad) / imgW),
    y: Math.max(0, (y0 - pad) / imgH),
    width: Math.min(1, (x1 - x0 + pad * 2) / imgW),
    height: Math.min(1, (y1 - y0 + pad * 2) / imgH),
  };
}

// ─── Recognizer ────────────────────────────────────────────────────────────

export class TesseractRecognizer implements IStickerRecognizer {
  private worker: Worker | null = null;
  private loading = false;

  async init() {
    if (this.worker || this.loading) return;
    this.loading = true;
    this.worker = await createWorker('eng', 1, {
      // Allow digits + uppercase letters (covers numbers and player names)
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
      tessedit_pageseg_mode: PSM.SPARSE_TEXT as unknown as string,
    });
    this.loading = false;
  }

  get isReady() { return !!this.worker && !this.loading; }
  get isLoading() { return this.loading; }

  async recognize(frame: unknown): Promise<DetectedSticker[]> {
    if (!this.worker || typeof frame !== 'string') return [];

    const { data } = await this.worker.recognize(frame);

    // Use word-level data with bounding boxes
    const words: Word[] = (data.words ?? [])
      .filter((w: any) => w.text.trim().length > 0 && w.confidence > 30)
      .map((w: any) => ({ text: w.text.trim(), bbox: w.bbox }));

    if (words.length === 0) return [];

    const imgW = data.imageWidth ?? 1000;
    const imgH = data.imageHeight ?? 1000;

    const clusters = clusterWords(words, imgW, imgH);
    const found: DetectedSticker[] = [];
    const seenIds = new Set<string>();

    for (const cluster of clusters) {
      const meta = matchCluster(cluster, imgW, imgH);
      if (!meta || seenIds.has(meta.id)) continue;
      seenIds.add(meta.id);
      found.push({
        stickerId: meta.id,
        number: meta.number,
        playerName: meta.playerName,
        country: meta.country,
        confidence: 0.85,
        isOwned: false,
        boundingBox: clusterBBox(cluster, imgW, imgH),
      });
    }

    return found;
  }

  async terminate() {
    await this.worker?.terminate();
    this.worker = null;
  }
}
