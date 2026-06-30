import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlbum } from '@/features/album/useAlbum';
import { C } from '@/constants/colors';

export function SettingsScreen() {
  const { stats, reset } = useAlbum();

  const handleReset = () => {
    Alert.alert(
      'Apagar coleção',
      'Todas as figurinhas marcadas serão desmarcadas. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: reset,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Configurações</Text>

        {/* Progress */}
        <SectionHeader label="Progresso" />
        <View style={styles.card}>
          <StatRow label="Figurinhas coletadas" value={String(stats.owned)} />
          <Divider />
          <StatRow label="Figurinhas faltando" value={String(stats.total - stats.owned)} />
          <Divider />
          <StatRow
            label="Total do álbum"
            value={String(stats.total)}
            valueColor={C.accent}
          />
          <Divider />
          <StatRow
            label="Percentual completo"
            value={`${stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0}%`}
            valueColor={C.accent}
          />
        </View>

        {/* Scanner info */}
        <SectionHeader label="Scanner" />
        <View style={styles.card}>
          <InfoRow label="Motor atual" value="Mock (desenvolvimento)" />
          <Divider />
          <InfoRow label="Taxa de detecção" value="~10 FPS" />
          <Divider />
          <InfoRow label="Precisão" value="Simulada" />
        </View>

        {/* Tech info */}
        <SectionHeader label="Tecnologia" />
        <View style={styles.card}>
          <InfoRow label="Framework" value="React Native + Expo" />
          <Divider />
          <InfoRow label="Estado" value="Zustand + AsyncStorage" />
          <Divider />
          <InfoRow label="Câmera" value="expo-camera" />
          <Divider />
          <InfoRow label="Upgrade" value="vision-camera + Frame Processors" />
        </View>

        {/* Danger zone */}
        <SectionHeader label="Zona de perigo" />
        <Pressable onPress={handleReset} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Apagar toda a coleção</Text>
        </Pressable>

        <Text style={styles.version}>StickerScan MVP · Copa 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label.toUpperCase()}</Text>;
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color: C.textMuted }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 24,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: { fontSize: 14, color: C.text },
  rowValue: { fontSize: 14, fontWeight: '600', color: C.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.border },
  dangerBtn: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  dangerBtnText: { color: C.danger, fontWeight: '700', fontSize: 15 },
  version: {
    textAlign: 'center',
    color: C.textDim,
    fontSize: 12,
    marginTop: 32,
  },
});
