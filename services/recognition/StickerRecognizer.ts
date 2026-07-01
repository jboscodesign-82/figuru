import { IStickerRecognizer } from '@/types';
import { MockStickerRecognizer } from './MockStickerRecognizer';
import { TesseractRecognizer } from './TesseractRecognizer';
import { ClaudeVisionRecognizer, getClaudeApiKey } from './ClaudeVisionRecognizer';

export type RecognizerType = 'mock' | 'tesseract' | 'claude' | 'auto';

export function createStickerRecognizer(type: RecognizerType = 'auto'): IStickerRecognizer {
  switch (type) {
    case 'claude':
      return new ClaudeVisionRecognizer();
    case 'tesseract':
      return new TesseractRecognizer();
    case 'mock':
      return new MockStickerRecognizer();
    case 'auto':
    default:
      // Use Claude if API key configured, otherwise Tesseract
      return getClaudeApiKey() ? new ClaudeVisionRecognizer() : new TesseractRecognizer();
  }
}
