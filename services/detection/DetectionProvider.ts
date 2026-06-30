import { IDetectionProvider, BoundingBox } from '@/types';

/**
 * Mock region detector — REPLACE with:
 *   - OpenCV contour detection (react-native-opencv3 or C++ worklet)
 *   - YOLO object detection (TensorFlow Lite)
 *
 * This runs per-frame inside the Vision Camera frame processor in production.
 */
export class MockDetectionProvider implements IDetectionProvider {
  async detectRegions(_frame: unknown): Promise<BoundingBox[]> {
    // REPLACE: call OpenCV or YOLO on the real frame
    const count = 2 + Math.floor(Math.random() * 3);
    return Array.from({ length: count }, (_, i) => ({
      x: 0.1 + (i % 2) * 0.45,
      y: 0.2 + Math.floor(i / 2) * 0.38,
      width: 0.38,
      height: 0.3,
    }));
  }
}
