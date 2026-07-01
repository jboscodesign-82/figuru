import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface WebCameraHandle {
  takePicture(): Promise<string | null>;
  captureFrame(): string | null;
}

export const WebCamera = forwardRef<WebCameraHandle>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
        }
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.warn('WebCamera: could not open back camera', err);
      }
    }

    start();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useImperativeHandle(ref, () => ({
    // Captura frame diretamente do stream de vídeo (para auto-scan)
    captureFrame(): string | null {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return null;
      const vW = video.videoWidth;
      const vH = video.videoHeight;
      if (!vW || !vH) return null;

      const TARGET_W = Math.min(1200, vW);
      const scale = TARGET_W / vW;
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_W;
      canvas.height = Math.round(vH * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    },

    // Abre câmera nativa (para scan manual com melhor foco)
    async takePicture(): Promise<string | null> {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) { resolve(null); return; }

          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise(r => { img.onload = r; });

          const iW = img.naturalWidth;
          const iH = img.naturalHeight;
          const TARGET_W = Math.min(1200, iW);
          const scale = TARGET_W / iW;
          const canvas = document.createElement('canvas');
          canvas.width = TARGET_W;
          canvas.height = Math.round(iH * scale);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, iW, iH, canvas.width, canvas.height);
          URL.revokeObjectURL(img.src);
          resolve(canvas.toDataURL('image/jpeg', 0.90));
        };

        input.oncancel = () => resolve(null);
        input.click();
      });
    },
  }));

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={styles as unknown as React.CSSProperties}
    />
  );
});

const styles = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
};
