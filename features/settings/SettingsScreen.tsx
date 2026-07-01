import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlbum } from '@/features/album/useAlbum';
import { getClaudeApiKey, setClaudeApiKey } from '@/services/recognition/ClaudeVisionRecognizer';
import { Gradient } from '@/components/Gradient';
import { C, HEADER_GRADIENT } from '@/constants/colors';

export function SettingsScreen() {
  const { stats, reset } = useAlbum();
  const [apiKey, setApiKey] = useState(getClaudeApiKey() ?? '');
  const [saved, setSaved] = useState(false);

  const handleSaveKey = () => {
    setClaudeApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
    <View style={styles.safe}>
      <Gradient colors={HEADER_GRADIENT} angle={135} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <View style={styles.logoMark}>
              <Ionicons name="settings" size={22} color="#fff" />
            </View>
            <Text style={styles.title}>Ajustes</Text>
          </View>
        </SafeAreaView>
      </Gradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

        {/* Claude Vision API */}
        <SectionHeader label="Scanner com IA (Claude Vision)" />
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Motor</Text>
            <Text style={[styles.rowValue, { color: apiKey ? C.success : C.textMuted }]}>
              {apiKey ? 'Claude Vision ✓' : 'Tesseract (padrão)'}
            </Text>
          </View>
          <Divider />
          <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
            <Text style={styles.rowLabel}>Anthropic API Key</Text>
            <TextInput
              style={styles.apiInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-ant-..."
              placeholderTextColor={C.textDim}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={handleSaveKey} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{saved ? 'Salvo!' : 'Salvar key'}</Text>
            </Pressable>
          </View>
          <Divider />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.textMuted, fontSize: 12, flexShrink: 1 }]}>
              A key fica salva só no seu dispositivo. Obtenha em console.anthropic.com
            </Text>
          </View>
        </View>

        {/* Danger zone */}
        <SectionHeader label="Zona de perigo" />
        <Pressable onPress={handleReset} style={styles.dangerBtn}>
          <Ionicons name="trash-outline" size={17} color={C.danger} />
          <Text style={styles.dangerBtnText}>Apagar toda a coleção</Text>
        </Pressable>

        <Text style={styles.version}>Figuru · Copa 2026</Text>
      </ScrollView>
    </View>
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
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 22,
  },
  logoMark: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
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
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  dangerBtnText: { color: C.danger, fontWeight: '700', fontSize: 15 },
  apiInput: {
    width: '100%',
    backgroundColor: C.surface2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.text,
    fontSize: 13,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  version: {
    textAlign: 'center',
    color: C.textDim,
    fontSize: 12,
    marginTop: 32,
  },
});
