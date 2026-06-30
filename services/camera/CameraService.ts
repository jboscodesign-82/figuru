/**
 * Thin abstraction over the camera API.
 *
 * Current: expo-camera (works in Expo Go, no native build needed)
 * Production: react-native-vision-camera + Frame Processors for real-time OCR
 *
 * To upgrade:
 *   1. Add react-native-vision-camera to package.json
 *   2. Implement VisionCameraService here
 *   3. Update ScannerScreen to use <Camera> from vision-camera
 *   4. Move MockStickerRecognizer.recognize() into a useFrameProcessor worklet
 */
export interface ICameraService {
  requestPermission(): Promise<boolean>;
}

export class ExpoCameraService implements ICameraService {
  async requestPermission(): Promise<boolean> {
    // expo-camera handles permissions declaratively via useCameraPermissions()
    return true;
  }
}
