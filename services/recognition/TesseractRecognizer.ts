import { createWorker, Worker } from 'tesseract.js';
import { IStickerRecognizer, DetectedSticker } from '@/types';
import albumData from '@/assets/data/stickers.json';

// number → sticker lookup built once at module load
const byNumber = new Map<number, { id: string; playerName: string; country: string }>();
albumData.pages.forEach((p) =>
  p.countries.forEach((c) =>
    c.stickers.forEach((s) =>
      byNumber.set(s.number, { id: s.id, playerName: s.playerName, country: c.code })
    )
  )
);

export class TesseractRecognizer implements IStickerRecognizer {
  private worker: Worker | null = null;
  private loading = false;

  async init() {
    if (this.worker || this.loading) return;
    this.loading = true;
    this.worker = await createWorker('eng', 1, {
      // Only recognize digits — much faster and fewer false positives
      tessedit_char_whitelist: '0123456789',
    });
    this.loading = false;
  }

  get isReady() {
    return !!this.worker && !this.loading;
  }

  get isLoading() {
    return this.loading;
  }

  /** frame must be an image URI or base64 string (result of takePictureAsync) */
  async recognize(frame: unknown): Promise<DetectedSticker[]> {
    if (!this.worker || typeof frame !== 'string') return [];

    const {
      data: { text },
    } = await this.worker.recognize(frame);

    // Extract all numbers found in the text
    const numbers = text.match(/\d{1,3}/g) ?? [];
    const found: DetectedSticker[] = [];
    const seen = new Set<string>();

    for (const raw of numbers) {
      const num = parseInt(raw, 10);
      if (num < 1 || num > 980) continue;
      const sticker = byNumber.get(num);
      if (!sticker || seen.has(sticker.id)) continue;
      seen.add(sticker.id);
      found.push({
        stickerId: sticker.id,
        number: num,
        playerName: sticker.playerName,
        country: sticker.country,
        confidence: 0.85,
        isOwned: false,
        boundingBox: { x: 0.1, y: 0.2, width: 0.8, height: 0.6 },
      });
    }

    return found;
  }

  async terminate() {
    await this.worker?.terminate();
    this.worker = null;
  }
}
