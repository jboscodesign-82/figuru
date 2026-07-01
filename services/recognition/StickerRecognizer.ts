import { IStickerRecognizer } from '@/types';
import { MockStickerRecognizer } from './MockStickerRecognizer';
import { TesseractRecognizer } from './TesseractRecognizer';
import { ClaudeVisionRecognizer, getClaudeApiKey } from './ClaudeVisionRecognizer';

export type RecognizerType = 'mock' | 'tesseract' | 'claude' | 'auto';

export function createStickerRecognizer(
  type: RecognizerType = 'auto',
  log?: (msg: string) => void,
): IStickerRecognizer {
  switch (type) {
    case 'claude':
      return new ClaudeVisionRecognizer(log);
    case 'tesseract':
      return new TesseractRecognizer();
    case 'mock':
      return new MockStickerRecognizer();
    case 'auto':
    default:
      return getClaudeApiKey() ? new ClaudeVisionRecognizer(log) : new TesseractRecognizer();
  }
}
