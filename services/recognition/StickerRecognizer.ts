import { IStickerRecognizer } from '@/types';
import { MockStickerRecognizer } from './MockStickerRecognizer';
import { TesseractRecognizer } from './TesseractRecognizer';

export type RecognizerType = 'mock' | 'tesseract' | 'mlkit' | 'tensorflow';

export function createStickerRecognizer(type: RecognizerType = 'tesseract'): IStickerRecognizer {
  switch (type) {
    case 'tesseract':
      return new TesseractRecognizer();
    case 'mock':
      return new MockStickerRecognizer();
    default:
      return new TesseractRecognizer();
  }
}
