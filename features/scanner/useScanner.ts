import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';

// Single recognizer instance (avoids re-creating the model on every render)
const recognizer = createStickerRecognizer('mock');

// Target ~10 FPS — process one frame every 100 ms
const FRAME_INTERVAL_MS = 100;

export function useScanner() {
  const { isOwned, markOwned } = useAlbumStore();
  const { detectedStickers, newStickers, updateDetections, clearDetections } =
    useScannerStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Start continuous frame processing */
  const startScanning = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        // REPLACE null with the actual Frame from react-native-vision-camera:
        //   useFrameProcessor((frame) => { recognizer.recognize(frame); }, [...])
        const detected = await recognizer.recognize(null);

        // Annotate with live owned status from Zustand store
        const annotated = detected.map((d) => ({
          ...d,
          isOwned: isOwned(d.stickerId),
        }));

        updateDetections(annotated);
      } finally {
        setIsProcessing(false);
      }
    }, FRAME_INTERVAL_MS);
  }, [isOwned, isProcessing, updateDetections]);

  const stopScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    clearDetections();
  }, [clearDetections]);

  /** Mark all new stickers as owned, then navigate home */
  const addNewStickers = useCallback(() => {
    const ids = newStickers.map((s) => s.stickerId);
    markOwned(ids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stopScanning();
    router.replace('/');
  }, [newStickers, markOwned, stopScanning]);

  // Clean up on unmount
  useEffect(() => () => stopScanning(), [stopScanning]);

  return {
    detectedStickers,
    newStickers,
    startScanning,
    stopScanning,
    addNewStickers,
  };
}
