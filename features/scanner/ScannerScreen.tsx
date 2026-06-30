import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useScanner } from './useScanner';
import { OverlayBox } from './components/OverlayBox';
import { AddStickersButton } from './components/AddStickersButton';
import { WebCamera, WebCameraHandle } from './components/WebCamera';
import { C } from '@/constants/colors';

export function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const nativeCamRef = useRef<CameraView>(null);
  const webCamRef = useRef<WebCameraHandle>(null);
  const cameraRef = Platform.OS === 'web' ? webCamRef : nativeCamRef;

  const { ocrReady, scanning, detectedStickers, newStickers, scan, addNewStickers } =
    useScanner(cameraRef as any);

  // On web, permissions are handled by the browser — skip Expo permission flow
  if (Platform.OS !== 'web') {
    if (!permission) {
      return (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator color={C.accentBlue} />
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <SafeAreaView style={[styles.container, styles.center]}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Câmera necessária</Text>
          <Text style={styles.permSub}>
            Para escanear figurinhas precisamos acessar sua câmera.
          </Text>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Permitir acesso</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Voltar</Text>
          </Pressable>
        </SafeAreaView>
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* Camera — web uses native getUserMedia, native uses CameraView */}
      {Platform.OS === 'web' ? (
        <WebCamera ref={webCamRef} />
      ) : (
        <CameraView ref={nativeCamRef} style={StyleSheet.absoluteFill} facing="back" />
      )}

      {/* Detection overlays */}
      {detectedStickers.map((sticker) => (
        <OverlayBox key={sticker.stickerId} sticker={sticker} />
      ))}

      {/* Top HUD */}
      <SafeAreaView style={styles.hud} edges={['top']}>
        <View style={styles.hudInner}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>

          <View style={styles.hudInfo}>
            <View style={[styles.dot, ocrReady && styles.dotReady]} />
            <Text style={styles.hudText}>
              {ocrReady ? 'Pronto para escanear' : 'Carregando OCR…'}
            </Text>
          </View>

          <View style={styles.hudPills}>
            {detectedStickers.length > 0 && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>
                  {detectedStickers.length} detectada{detectedStickers.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {newStickers.length > 0 && (
              <View style={[styles.pill, styles.pillBlue]}>
                <Text style={[styles.pillText, styles.pillTextBlue]}>
                  {newStickers.length} nova{newStickers.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Viewfinder corners */}
      <View style={styles.viewfinder} pointerEvents="none">
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>

      {/* Scan button */}
      <View style={styles.scanBtnWrapper}>
        <Pressable
          style={[styles.scanBtn, (!ocrReady || scanning) && styles.scanBtnDisabled]}
          onPress={scan}
          disabled={!ocrReady || scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.scanBtnIcon}>📷</Text>
          )}
        </Pressable>
        <Text style={styles.scanBtnLabel}>
          {scanning ? 'Lendo…' : ocrReady ? 'Escanear figurinha' : 'Carregando…'}
        </Text>
      </View>

      <AddStickersButton count={newStickers.length} onPress={addNewStickers} />
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
    backgroundColor: C.bg,
  },
  permIcon: { fontSize: 48 },
  permTitle: { fontSize: 20, fontWeight: '700', color: C.text, textAlign: 'center' },
  permSub: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
  permBtn: {
    backgroundColor: C.accentBlue,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  permBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  backBtn: { marginTop: 4 },
  backBtnText: { color: C.textMuted, fontSize: 14 },
  hud: { position: 'absolute', top: 0, left: 0, right: 0 },
  hudInner: { marginHorizontal: 16, marginTop: 8, gap: 8 },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hudInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.danger },
  dotReady: { backgroundColor: C.success },
  hudText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  hudPills: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillBlue: { backgroundColor: 'rgba(76,201,240,0.25)' },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pillTextBlue: { color: C.accentBlue },
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  tl: { top: '30%', left: '10%', borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 4 },
  tr: { top: '30%', right: '10%', borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  bl: { top: '68%', left: '10%', borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  br: { top: '68%', right: '10%', borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },
  scanBtnWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  scanBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  scanBtnDisabled: { opacity: 0.4 },
  scanBtnIcon: { fontSize: 28 },
  scanBtnLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
});
