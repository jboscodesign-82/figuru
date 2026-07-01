import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useScanner } from './useScanner';
import { WebCamera, WebCameraHandle } from './components/WebCamera';
import { C } from '@/constants/colors';
import type { DetectedSticker } from '@/types';

export function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const log = useCallback((msg: string) => { console.log('[DBG]', msg); }, []);

  const nativeCamRef = useRef<CameraView>(null);
  const webCamRef = useRef<WebCameraHandle>(null);
  const cameraRef = Platform.OS === 'web' ? webCamRef : nativeCamRef;

  const { ocrReady, scanning, scanError, detectedStickers, newStickers, scan, addNewStickers } =
    useScanner(cameraRef as any, log);

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
      {/* ── Camera area ── */}
      <View style={styles.cameraArea}>
        {Platform.OS === 'web' ? (
          <WebCamera ref={webCamRef} />
        ) : (
          <CameraView ref={nativeCamRef} style={StyleSheet.absoluteFill} facing="back" />
        )}

        {/* Top HUD */}
        <SafeAreaView style={styles.hud} edges={['top']}>
          <View style={styles.hudInner}>
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
            <View style={styles.hudStatus}>
              <View style={[styles.dot, ocrReady && styles.dotReady]} />
              <Text style={styles.hudText}>
                {scanning ? 'Reconhecendo…' : ocrReady ? 'Pronto para escanear' : 'Carregando…'}
              </Text>
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
          <Pressable style={[styles.scanBtn, scanning && styles.scanBtnDisabled]} onPress={scan}>
            {scanning
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.scanBtnIcon}>📷</Text>
            }
          </Pressable>
          <Text style={styles.scanBtnLabel}>
            {scanning ? 'Lendo…' : 'Escanear figurinha'}
          </Text>
        </View>
      </View>

      {/* ── Results panel ── */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Figurinhas detectadas</Text>
          {detectedStickers.length > 0 && (
            <Text style={styles.panelCount}>{detectedStickers.length}</Text>
          )}
        </View>

        {detectedStickers.length === 0 ? (
          <View style={styles.emptyState}>
            {scanError ? (
              <>
                <Text style={styles.emptyText}>Não foi possível reconhecer.</Text>
                <Pressable style={styles.retryBtn} onPress={scan}>
                  <Text style={styles.retryBtnText}>Tente novamente</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.emptyText}>
                {scanning ? 'Analisando imagem…' : 'Aponte para o verso da figurinha e escaneie'}
              </Text>
            )}
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {detectedStickers.map((s) => (
              <StickerRow key={s.stickerId} sticker={s} />
            ))}
          </ScrollView>
        )}

        {newStickers.length > 0 && (
          <Pressable style={styles.addAllBtn} onPress={addNewStickers}>
            <Text style={styles.addAllText}>
              Adicionar {newStickers.length} nova{newStickers.length !== 1 ? 's' : ''} ao álbum
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function StickerRow({ sticker }: { sticker: DetectedSticker }) {
  const isOwned = sticker.isOwned;
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, isOwned ? styles.rowIconOwned : styles.rowIconNew]}>
        <Text style={styles.rowIconText}>{isOwned ? '✓' : '+'}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{sticker.playerName}</Text>
        <Text style={styles.rowSub}>{sticker.stickerId} · {sticker.country}</Text>
      </View>
      <View style={[styles.rowBadge, isOwned ? styles.rowBadgeOwned : styles.rowBadgeNew]}>
        <Text style={[styles.rowBadgeText, isOwned ? styles.rowBadgeTextOwned : styles.rowBadgeTextNew]}>
          {isOwned ? 'repetida' : 'nova'}
        </Text>
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
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

  // Camera
  cameraArea: {
    height: '55%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
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
  hudStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.danger },
  dotReady: { backgroundColor: C.success },
  hudText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  viewfinder: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  tl: { top: '20%', left: '10%', borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 4 },
  tr: { top: '20%', right: '10%', borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  bl: { top: '72%', left: '10%', borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  br: { top: '72%', right: '10%', borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },
  scanBtnWrapper: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  scanBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  scanBtnDisabled: { opacity: 0.4 },
  scanBtnIcon: { fontSize: 26 },
  scanBtnLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },

  // Results panel
  panel: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  panelTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  panelCount: {
    backgroundColor: C.accentBlue,
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: C.textMuted, fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: C.accentBlue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  list: { flex: 1 },

  // Sticker row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconNew: { backgroundColor: C.accent },
  rowIconOwned: { backgroundColor: C.surface2 },
  rowIconText: { color: '#000', fontWeight: '800', fontSize: 16 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: C.text },
  rowSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  rowBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rowBadgeNew: { backgroundColor: 'rgba(74,222,128,0.15)' },
  rowBadgeOwned: { backgroundColor: C.surface2 },
  rowBadgeText: { fontSize: 12, fontWeight: '700' },
  rowBadgeTextNew: { color: C.success },
  rowBadgeTextOwned: { color: C.textMuted },

  // Add all button
  addAllBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  addAllText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
