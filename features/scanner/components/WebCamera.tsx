import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet } from 'react-native';

export interface WebCameraHandle {
  takePicture(): Promise<string | null>;
}

export const WebCamera = forwardRef<WebCameraHandle>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        // Try exact back camera first, fall back to ideal
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
    async takePicture(): Promise<string | null> {
      const video = videoRef.current;
      if (!video) return null;

      const W = video.videoWidth;
      const H = video.videoHeight;
      if (!W || !H) return null;

      // Step 1: draw raw frame
      const raw = document.createElement('canvas');
      raw.width = W;
      raw.height = H;
      raw.getContext('2d')!.drawImage(video, 0, 0);

      // Step 2: apply grayscale + contrast boost for better OCR
      const processed = document.createElement('canvas');
      processed.width = W;
      processed.height = H;
      const ctx = processed.getContext('2d')!;
      ctx.filter = 'grayscale(1) contrast(2) brightness(1.1)';
      ctx.drawImage(raw, 0, 0);

      return processed.toDataURL('image/jpeg', 0.92);
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
