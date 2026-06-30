import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CameraView } from 'expo-camera';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import { TesseractRecognizer } from '@/services/recognition/TesseractRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';

const recognizer = createStickerRecognizer('tesseract');

export function useScanner(cameraRef: React.RefObject<CameraView>) {
  const { isOwned, markOwned } = useAlbumStore();
  const { detectedStickers, newStickers, updateDetections, clearDetections } = useScannerStore();

  const [ocrReady, setOcrReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const mountedRef = useRef(true);

  // Initialize Tesseract worker on mount
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

  /** Take a photo and run OCR on it */
  const scan = useCallback(async () => {
    if (!cameraRef.current || scanning) return;
    setScanning(true);
    clearDetections();
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (!photo?.uri) return;

      const detected = await recognizer.recognize(photo.uri);
      const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
      if (mountedRef.current) updateDetections(annotated);

      if (annotated.length > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
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

  return {
    ocrReady,
    scanning,
    detectedStickers,
    newStickers,
    scan,
    addNewStickers,
  };
}
