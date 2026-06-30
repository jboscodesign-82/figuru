import { IOCRProvider } from '@/types';

/**
 * Mock OCR — REPLACE with:
 *   - TesseractOCRProvider:  react-native-tesseract-ocr
 *   - MLKitOCRProvider:      @react-native-ml-kit/text-recognition
 *
 * The Vision Camera frame processor plugin goes here; it receives a Frame
 * and returns the extracted text synchronously on the JS thread (worklets).
 */
export class MockOCRProvider implements IOCRProvider {
  async extractText(_frame: unknown): Promise<string> {
    // REPLACE: run Tesseract / ML Kit on the real frame
    const codes = ['BRA001', 'ARG009', 'FRA008', 'ENG006', 'GER007'];
    return codes[Math.floor(Math.random() * codes.length)];
  }
}
