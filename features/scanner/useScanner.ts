import { useCallback, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import { MockStickerRecognizer } from '@/services/recognition/MockStickerRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';

const recognizer = createStickerRecognizer('mock');
const FRAME_INTERVAL_MS = 500;

export function useScanner() {
  const { isOwned, markOwned } = useAlbumStore();
  const { detectedStickers, newStickers, updateDetections, clearDetections } =
    useScannerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScanning = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      const detected = await recognizer.recognize(null);
      const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
      updateDetections(annotated);
    }, FRAME_INTERVAL_MS);
  }, [isOwned, updateDetections]);

  const stopScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recognizer instanceof MockStickerRecognizer) recognizer.clear();
    clearDetections();
  }, [clearDetections]);

  /** Trigger a simulated scan (mock mode only) */
  const simulateScan = useCallback(() => {
    if (recognizer instanceof MockStickerRecognizer) recognizer.simulate();
  }, []);

  const addNewStickers = useCallback(() => {
    const ids = newStickers.map((s) => s.stickerId);
    markOwned(ids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stopScanning();
    router.replace('/');
  }, [newStickers, markOwned, stopScanning]);

  useEffect(() => () => stopScanning(), [stopScanning]);

  return {
    detectedStickers,
    newStickers,
    startScanning,
    stopScanning,
    simulateScan,
    addNewStickers,
  };
}
