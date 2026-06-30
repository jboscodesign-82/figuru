import { DetectedSticker, BoundingBox, IStickerRecognizer } from '@/types';
import albumData from '@/assets/data/stickers.json';

// Pre-build flat list of all stickers for O(1) random sampling
const ALL = albumData.pages.flatMap((p) =>
  p.countries.flatMap((c) =>
    c.stickers.map((s) => ({
      id: s.id,
      number: s.number,
      playerName: s.playerName,
      country: c.code,
    })),
  ),
);

/**
 * Mock implementation — simulates finding 2–5 stickers in a frame.
 *
 * REPLACE THIS CLASS with:
 *   - TesseractRecognizer  → tesseract.js / react-native-tesseract-ocr
 *   - MLKitRecognizer      → @react-native-ml-kit/text-recognition
 *   - YOLORecognizer       → TensorFlow Lite + custom sticker model
 *
 * The consumer (useScanner) only depends on IStickerRecognizer, so the swap
 * is a one-line change in services/recognition/StickerRecognizer.ts.
 */
export class MockStickerRecognizer implements IStickerRecognizer {
  private triggered = false;
  private cached: DetectedSticker[] = [];

  /** Call this to simulate finding stickers (used by the UI "Simular" button) */
  simulate() {
    const count = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...ALL].sort(() => Math.random() - 0.5).slice(0, count);
    this.cached = shuffled.map((s, i) => ({
      stickerId: s.id,
      number: s.number,
      playerName: s.playerName,
      country: s.country,
      confidence: 0.75 + Math.random() * 0.25,
      isOwned: false,
      boundingBox: buildBBox(i, count),
    }));
    this.triggered = true;
  }

  clear() {
    this.cached = [];
    this.triggered = false;
  }

  async recognize(_frame: unknown): Promise<DetectedSticker[]> {
    return this.cached;
  }
}

function buildBBox(index: number, total: number): BoundingBox {
  const cols = Math.ceil(Math.sqrt(total));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const cellW = 0.65 / cols;
  const cellH = 0.32;
  return {
    x: 0.15 + col * (cellW + 0.06),
    y: 0.22 + row * (cellH + 0.06),
    width: cellW,
    height: cellH,
  };
}
