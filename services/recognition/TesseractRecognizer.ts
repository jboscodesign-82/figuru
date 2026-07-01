import { createWorker, PSM, Worker } from 'tesseract.js';
import { IStickerRecognizer, DetectedSticker, BoundingBox } from '@/types';
import albumData from '@/assets/data/stickers.json';

// ─── Lookup tables ──────────────────────────────────────────────────────────

interface StickerMeta {
  id: string;
  number: number;
  playerName: string;
  country: string;
}

const byNumber = new Map<number, StickerMeta>();
const byNameWord = new Map<string, StickerMeta[]>();

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics: é→e, ã→a, ê→e, etc.
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

albumData.pages.forEach((p) =>
  p.countries.forEach((c) =>
    c.stickers.forEach((s) => {
      const meta: StickerMeta = { id: s.id, number: s.number, playerName: s.playerName, country: c.code };
      byNumber.set(s.number, meta);
      s.playerName.split(/\s+/).forEach((word) => {
        const key = normalize(word);
        if (key.length < 3) return;
        if (!byNameWord.has(key)) byNameWord.set(key, []);
        byNameWord.get(key)!.push(meta);
      });
    })
  )
);

// ─── Word clustering ────────────────────────────────────────────────────────

interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

function clusterWords(words: OcrWord[], imgH: number): OcrWord[][] {
  const gap = imgH * 0.20;
  const clusters: OcrWord[][] = [];
  for (const word of words) {
    const cy = (word.bbox.y0 + word.bbox.y1) / 2;
    let placed = false;
    for (const cluster of clusters) {
      const refCy = (cluster[0].bbox.y0 + cluster[0].bbox.y1) / 2;
      if (Math.abs(cy - refCy) < gap) {
        cluster.push(word);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push([word]);
  }
  return clusters;
}

function matchCluster(cluster: OcrWord[]): StickerMeta | null {
  let numberMatch: StickerMeta | null = null;
  let nameMatch: StickerMeta | null = null;

  for (const w of cluster) {
    const digits = w.text.replace(/\D/g, '');
    const num = parseInt(digits, 10);
    if (digits.length >= 1 && digits.length <= 3 && num >= 1 && num <= 980 && byNumber.has(num)) {
      numberMatch = byNumber.get(num)!;
    }
    const key = normalize(w.text);
    if (key.length >= 3) {
      const candidates = byNameWord.get(key);
      if (candidates) {
        if (numberMatch) {
          const exact = candidates.find((c) => c.id === numberMatch!.id);
          if (exact) { nameMatch = exact; }
        }
        if (!nameMatch) nameMatch = candidates[0];
      }
    }
  }

  // Number confirmed by name → most reliable
  if (numberMatch && nameMatch && numberMatch.id === nameMatch.id) return numberMatch;
  if (numberMatch) return numberMatch;
  if (nameMatch) return nameMatch;
  return null;
}

function clusterBBox(cluster: OcrWord[], imgW: number, imgH: number): BoundingBox {
  const x0 = Math.min(...cluster.map((w) => w.bbox.x0));
  const y0 = Math.min(...cluster.map((w) => w.bbox.y0));
  const x1 = Math.max(...cluster.map((w) => w.bbox.x1));
  const y1 = Math.max(...cluster.map((w) => w.bbox.y1));
  const pad = imgH * 0.04;
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
    this.worker = await createWorker('eng', 1);
    await this.worker.setParameters({
      // sem whitelist: lê acentos (é, ã, ê) que aparecem em nomes de jogadores
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });
    this.loading = false;
  }

  get isReady() { return !!this.worker && !this.loading; }

  async recognize(frame: unknown): Promise<DetectedSticker[]> {
    if (!this.worker || typeof frame !== 'string') return [];

    const { data } = await this.worker.recognize(frame);

    const rawText = data.text?.replace(/\n/g, ' ').trim().slice(0, 200) ?? '';
    console.log('[OCR] texto:', rawText);
    // Expose raw text to debug panel via global
    if (typeof (globalThis as any).__ocrDebug === 'function') (globalThis as any).__ocrDebug(rawText);

    const allWords: OcrWord[] = [];
    for (const word of (data.words ?? [])) {
      if (!word.text?.trim() || word.confidence < 5) continue;
      allWords.push({ text: word.text.trim(), bbox: word.bbox, confidence: word.confidence });
    }

    console.log('[OCR] palavras com confiança >20:', allWords.map(w => `"${w.text}"(${Math.round(w.confidence)}%)`).join(', '));

    if (allWords.length === 0) return [];

    // Estimate image dimensions from word bboxes
    const imgW = Math.max(...allWords.map((w) => w.bbox.x1), 100);
    const imgH = Math.max(...allWords.map((w) => w.bbox.y1), 100);

    const clusters = clusterWords(allWords, imgH);
    const found: DetectedSticker[] = [];
    const seenIds = new Set<string>();

    for (const cluster of clusters) {
      const meta = matchCluster(cluster);
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
