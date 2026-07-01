import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';
import type { WebCameraHandle } from './components/WebCamera';
import type { CameraView } from 'expo-camera';

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
    console.log('[Scanner] montado, tem init?', typeof recognizer.init);

    const doInit = async () => {
      try {
        if (typeof recognizer.init === 'function') {
          console.log('[Scanner] chamando init()...');
          await recognizer.init();
          console.log('[Scanner] init() concluído, isReady:', recognizer.isReady);
        }
        if (mountedRef.current) setOcrReady(true);
      } catch (e) {
        console.error('[Scanner] erro no init:', e);
        // mesmo com erro, habilita o botão para tentar reconhecer
        if (mountedRef.current) setOcrReady(true);
      }
    };

    doInit();

    return () => {
      mountedRef.current = false;
      clearDetections();
    };
  }, [clearDetections]);

  const scan = useCallback(async () => {
    console.log('[Scanner] scan() chamado | ocrReady:', ocrReady, '| camRef:', !!cameraRef.current);

    if (scanning) return;
    if (!cameraRef.current) {
      console.warn('[Scanner] cameraRef.current é null');
      return;
    }

    setScanning(true);
    clearDetections();

    try {
      const cam = cameraRef.current as any;
      let uri: string | null = null;

      if (typeof cam.takePicture === 'function') {
        console.log('[Scanner] usando WebCamera.takePicture()');
        uri = await cam.takePicture();
      } else if (typeof cam.takePictureAsync === 'function') {
        console.log('[Scanner] usando CameraView.takePictureAsync()');
        const photo = await cam.takePictureAsync({ quality: 0.8, base64: false });
        uri = photo?.uri ?? null;
      } else {
        console.error('[Scanner] câmera sem método de captura. Métodos:', Object.getOwnPropertyNames(cam));
      }

      console.log('[Scanner] uri capturada:', typeof uri, uri?.slice(0, 80));
      if (!uri) return;

      const detected = await recognizer.recognize(uri);
      console.log('[Scanner] detectou', detected.length, 'figurinhas:', detected.map(d => `#${d.number} ${d.playerName}`));

      const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
      if (mountedRef.current) updateDetections(annotated);
      if (annotated.length > 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.error('[Scanner] erro ao escanear:', e);
    } finally {
      if (mountedRef.current) setScanning(false);
    }
  }, [cameraRef, scanning, ocrReady, isOwned, updateDetections, clearDetections]);

  const addNewStickers = useCallback(() => {
    const ids = newStickers.map((s) => s.stickerId);
    markOwned(ids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearDetections();
    router.replace('/');
  }, [newStickers, markOwned, clearDetections]);

  return { ocrReady, scanning, detectedStickers, newStickers, scan, addNewStickers };
}
