import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CameraView } from 'expo-camera';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import { TesseractRecognizer } from '@/services/recognition/TesseractRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';
import type { WebCameraHandle } from './components/WebCamera';

export type CameraRef = React.RefObject<CameraView> | React.RefObject<WebCameraHandle>;

const recognizer = createStickerRecognizer('tesseract');

export function useScanner(cameraRef: CameraRef) {
  const { isOwned, markOwned } = useAlbumStore();
  const { detectedStickers, newStickers, updateDetections, clearDetections } = useScannerStore();

  const [ocrReady, setOcrReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (recognizer instanceof TesseractRecognizer) {
      recognizer.init().then(() => {
        if (mountedRef.current) setOcrReady(true);
      });
    }
    return () => {
      mountedRef.current = false;
      if (recognizer instanceof TesseractRecognizer) recognizer.terminate();
      clearDetections();
    };
  }, [clearDetections]);

  const scan = useCallback(async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    clearDetections();
    try {
      let uri: string | null = null;

      // Web camera handle has takePicture(), CameraView has takePictureAsync()
      const cam = cameraRef.current as any;
      if (typeof cam.takePicture === 'function') {
        uri = await cam.takePicture();
      } else if (typeof cam.takePictureAsync === 'function') {
        const photo = await cam.takePictureAsync({ quality: 0.8, base64: false });
        uri = photo?.uri ?? null;
      }

      if (!uri) return;

      const detected = await recognizer.recognize(uri);
      console.log('[Scanner] OCR detectou:', detected.length, 'figurinhas', detected.map(d => `${d.number} ${d.playerName}`));
      const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
      if (mountedRef.current) updateDetections(annotated);
      if (annotated.length > 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } finally {
      if (mountedRef.current) setScanning(false);
    }
  }, [cameraRef, scanning, isOwned, updateDetections, clearDetections]);

  const addNewStickers = useCallback(() => {
    const ids = newStickers.map((s) => s.stickerId);
    markOwned(ids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearDetections();
    router.replace('/');
  }, [newStickers, markOwned, clearDetections]);

  return { ocrReady, scanning, detectedStickers, newStickers, scan, addNewStickers };
}
