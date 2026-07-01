import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { createStickerRecognizer } from '@/services/recognition/StickerRecognizer';
import { getClaudeApiKey } from '@/services/recognition/ClaudeVisionRecognizer';
import useAlbumStore from '@/store/useAlbumStore';
import useScannerStore from '@/store/useScannerStore';
import type { WebCameraHandle } from './components/WebCamera';
import type { CameraView } from 'expo-camera';

export type CameraRef = React.RefObject<CameraView> | React.RefObject<WebCameraHandle>;

// Compara dois data URLs via canvas 32x32 — retorna true se frames são suficientemente diferentes
function framesAreDifferent(a: string, b: string): Promise<boolean> {
  return new Promise((resolve) => {
    const SIZE = 32;
    const canvasA = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasA.width = canvasB.width = SIZE;
    canvasA.height = canvasB.height = SIZE;

    let loaded = 0;
    const imgA = new Image();
    const imgB = new Image();

    const check = () => {
      if (++loaded < 2) return;
      const ctxA = canvasA.getContext('2d')!;
      const ctxB = canvasB.getContext('2d')!;
      ctxA.drawImage(imgA, 0, 0, SIZE, SIZE);
      ctxB.drawImage(imgB, 0, 0, SIZE, SIZE);
      const dA = ctxA.getImageData(0, 0, SIZE, SIZE).data;
      const dB = ctxB.getImageData(0, 0, SIZE, SIZE).data;
      let diff = 0;
      for (let i = 0; i < dA.length; i += 4) {
        diff += Math.abs(dA[i] - dB[i]) + Math.abs(dA[i+1] - dB[i+1]) + Math.abs(dA[i+2] - dB[i+2]);
      }
      // Threshold: média de 15 por pixel → cena mudou
      resolve(diff / (SIZE * SIZE * 3) > 15);
    };

    imgA.onload = imgB.onload = check;
    imgA.src = a;
    imgB.src = b;
  });
}

export function useScanner(cameraRef: CameraRef, log: (msg: string) => void) {
  const { isOwned, markOwned } = useAlbumStore();
  const { detectedStickers, newStickers, updateDetections, clearDetections } = useScannerStore();

  const [ocrReady, setOcrReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(false);
  const mountedRef = useRef(true);
  const scanningRef = useRef(false); // ref para acessar dentro do interval
  const lastFrameRef = useRef<string | null>(null);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    (globalThis as any).__ocrDebug = (text: string) => log(`OCR: "${text.slice(0, 60)}"`);

    const hasKey = !!getClaudeApiKey();
    log(`motor: ${hasKey ? 'Claude Vision (auto-scan)' : 'Tesseract'}`);
    if (mountedRef.current) setOcrReady(true);

    return () => {
      mountedRef.current = false;
      clearDetections();
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [clearDetections, log]);

  const runScan = useCallback(async (uri: string) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanning(true);
    setScanError(false);

    try {
      const rec = createStickerRecognizer('auto', log);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout 12s')), 12000)
      );
      const detected = await Promise.race([rec.recognize(uri), timeout]);
      log(`detectou ${detected.length} figurinha(s)`);

      if (detected.length > 0) {
        // Para o auto-scan assim que detectar algo
        if (autoIntervalRef.current) {
          clearInterval(autoIntervalRef.current);
          autoIntervalRef.current = null;
        }
        const annotated = detected.map((d) => ({ ...d, isOwned: isOwned(d.stickerId) }));
        if (mountedRef.current) updateDetections(annotated);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e: any) {
      log(`ERR: ${e?.message ?? e}`);
      if (mountedRef.current) setScanError(true);
    } finally {
      scanningRef.current = false;
      if (mountedRef.current) setScanning(false);
    }
  }, [log, isOwned, updateDetections]);

  // Inicia auto-scan quando a câmera estiver pronta
  const startAutoScan = useCallback(() => {
    if (autoIntervalRef.current) return;

    const cam = cameraRef.current as any;
    if (typeof cam?.captureFrame !== 'function') {
      // Câmera nativa (não web) — sem auto-scan
      log('auto-scan disponível apenas no modo web');
      return;
    }

    log('auto-scan iniciado (a cada 3s)');

    autoIntervalRef.current = setInterval(async () => {
      if (scanningRef.current) return;
      // Já tem resultados — para de escanear até o usuário limpar
      const cam = cameraRef.current as any;
      if (!cam?.captureFrame) return;

      const frame = cam.captureFrame() as string | null;
      if (!frame) return;

      // Compara com frame anterior — só processa se mudou
      const prev = lastFrameRef.current;
      lastFrameRef.current = frame;
      if (prev) {
        const changed = await framesAreDifferent(prev, frame);
        if (!changed) { log('frame estável, aguardando mudança…'); return; }
      }

      log('frame novo detectado, enviando…');
      await runScan(frame);
    }, 3000);
  }, [cameraRef, log, runScan]);

  // Scan manual (botão)
  const scan = useCallback(async () => {
    if (scanningRef.current) return;
    if (!cameraRef.current) { log('ERR: cam null'); return; }

    clearDetections();
    setScanError(false);

    const cam = cameraRef.current as any;
    let uri: string | null = null;

    if (typeof cam.takePicture === 'function') {
      uri = await cam.takePicture();
    } else if (typeof cam.takePictureAsync === 'function') {
      const photo = await cam.takePictureAsync({ quality: 0.8, base64: false });
      uri = photo?.uri ?? null;
    }

    if (!uri) return;
    await runScan(uri);
  }, [cameraRef, log, clearDetections, runScan]);

  const addNewStickers = useCallback(() => {
    const ids = newStickers.map((s) => s.stickerId);
    markOwned(ids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearDetections();
    // Reinicia auto-scan após adicionar
    lastFrameRef.current = null;
    startAutoScan();
  }, [newStickers, markOwned, clearDetections, startAutoScan]);

  const dismiss = useCallback(() => {
    clearDetections();
    lastFrameRef.current = null;
    startAutoScan();
  }, [clearDetections, startAutoScan]);

  return { ocrReady, scanning, scanError, detectedStickers, newStickers, scan, startAutoScan, addNewStickers, dismiss };
}
