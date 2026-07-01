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
    console.log('[Scanner] iniciando OCR...');
    if (recognizer instanceof TesseractRecognizer) {
      recognizer.init()
        .then(() => {
          console.log('[Scanner] OCR pronto!');
          if (mountedRef.current) setOcrReady(true);
        })
        .catch((e) => console.error('[Scanner] erro ao iniciar OCR:', e));
    }
    return () => {
      mountedRef.current = false;
      if (recognizer instanceof TesseractRecognizer) recognizer.terminate();
      clearDetections();
    };
  }, [clearDetections]);

  const scan = useCallback(async () => {
    console.log('[Scanner] scan clicado | ocrReady:', ocrReady, '| scanning:', scanning, '| camRef:', !!cameraRef.current);
    if (scanning) { console.log('[Scanner] ignorado: já está escaneando'); return; }
    if (!cameraRef.current) { console.log('[Scanner] ignorado: câmera não pronta'); return; }

    setScanning(true);
    clearDetections();
    try {
      let uri: string | null = null;
      const cam = cameraRef.current as any;
      console.log('[Scanner] métodos da câmera:', Object.keys(cam));

      if (typeof cam.takePicture === 'function') {
        console.log('[Scanner] usando WebCamera.takePicture()');
        uri = await cam.takePicture();
      } else if (typeof cam.takePictureAsync === 'function') {
        console.log('[Scanner] usando CameraView.takePictureAsync()');
        const photo = await cam.takePictureAsync({ quality: 0.8, base64: false });
        uri = photo?.uri ?? null;
      } else {
        console.warn('[Scanner] câmera sem método de captura!');
      }

      console.log('[Scanner] foto capturada, uri length:', uri?.length ?? 0);
      if (!uri) { console.warn('[Scanner] URI nulo, abortando'); return; }

      const detected = await recognizer.recognize(uri);
      console.log('[Scanner] detectou:', detected.length, detected.map(d => `${d.number} ${d.playerName}`));
      const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
      if (mountedRef.current) updateDetections(annotated);
      if (annotated.length > 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.error('[Scanner] erro:', e);
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
