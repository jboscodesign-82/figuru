import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';
import type { WebCameraHandle } from './components/WebCamera';
import type { CameraView } from 'expo-camera';

export type CameraRef = React.RefObject<CameraView> | React.RefObject<WebCameraHandle>;

const recognizer = createStickerRecognizer('auto');

export function useScanner(cameraRef: CameraRef, log: (msg: string) => void) {
  const { isOwned, markOwned } = useAlbumStore();
  const { detectedStickers, newStickers, updateDetections, clearDetections } = useScannerStore();

  const [ocrReady, setOcrReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    log(`montado | tem init: ${typeof recognizer.init}`);
    (globalThis as any).__ocrDebug = (text: string) => log(`OCR: "${text.slice(0, 60)}"`);

    const doInit = async () => {
      try {
        if (typeof recognizer.init === 'function') {
          log('iniciando OCR...');
          await recognizer.init();
          log('OCR pronto!');
        } else {
          log('sem init(), OK');
        }
        if (mountedRef.current) setOcrReady(true);
      } catch (e: any) {
        log(`erro init: ${e?.message ?? e}`);
        if (mountedRef.current) setOcrReady(true);
      }
    };

    doInit();
    return () => { mountedRef.current = false; clearDetections(); };
  }, [clearDetections, log]);

  const scan = useCallback(async () => {
    log(`scan() | cam: ${!!cameraRef.current} | scanning: ${scanning}`);
    if (scanning) return;
    if (!cameraRef.current) { log('ERR: cam null'); return; }

    setScanning(true);
    clearDetections();
    try {
      const cam = cameraRef.current as any;
      let uri: string | null = null;

      if (typeof cam.takePicture === 'function') {
        log('WebCamera.takePicture()...');
        uri = await cam.takePicture();
      } else if (typeof cam.takePictureAsync === 'function') {
        log('CameraView.takePictureAsync()...');
        const photo = await cam.takePictureAsync({ quality: 0.8, base64: false });
        uri = photo?.uri ?? null;
      } else {
        log('ERR: sem método de captura');
      }

      log(`uri: ${uri ? uri.slice(0, 40) + '...' : 'NULL'}`);
      if (!uri) return;

      log('reconhecendo...');
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout 10s')), 10000)
      );
      const detected = await Promise.race([recognizer.recognize(uri), timeout]);
      log(`detectou ${detected.length} figurinha(s)`);

      const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
      if (mountedRef.current) updateDetections(annotated);
      if (annotated.length > 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e: any) {
      log(`ERR: ${e?.message ?? e}`);
    } finally {
      if (mountedRef.current) setScanning(false);
    }
  }, [cameraRef, scanning, log, isOwned, updateDetections, clearDetections]);

  const addNewStickers = useCallback(() => {
    const ids = newStickers.map((s) => s.stickerId);
    markOwned(ids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearDetections();
    router.replace('/');
  }, [newStickers, markOwned, clearDetections]);

  return { ocrReady, scanning, detectedStickers, newStickers, scan, addNewStickers };
}
