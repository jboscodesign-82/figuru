import { IStickerRecognizer } from '@/types';
import { MockStickerRecognizer } from './MockStickerRecognizer';

export type RecognizerType = 'mock' | 'tesseract' | 'mlkit' | 'tensorflow';

/**
 * Factory — change `type` here to swap the recognition engine globally.
 * All consumers depend on IStickerRecognizer so nothing else needs to change.
 */
export function createStickerRecognizer(type: RecognizerType = 'mock'): IStickerRecognizer {
  switch (type) {
    case 'mock':
      return new MockStickerRecognizer();
    // TODO: case 'tesseract': return new TesseractRecognizer();
    // TODO: case 'mlkit':     return new MLKitRecognizer();
    // TODO: case 'tensorflow':return new TFLiteRecognizer();
    default:
      return new MockStickerRecognizer();
  }
}
