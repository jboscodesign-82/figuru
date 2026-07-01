import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlbum } from './useAlbum';
import { Gradient } from '@/components/Gradient';
import { C, HEADER_GRADIENT, countryGradient } from '@/constants/colors';
import type { Country, Sticker } from '@/types';

export function AlbumScreen() {
  const { pages, ownedIds, toggleSticker, stats, progressPercent } = useAlbum();

  const countries = useMemo(
    () => pages.flatMap((p) => p.countries),
    [pages],
  );

  return (
    <View style={styles.safe}>
      <FlatList
        data={countries}
        keyExtractor={(c: Country) => c.code}
        ListHeaderComponent={<Header stats={stats} progressPercent={progressPercent} />}
        renderItem={({ item }: { item: Country }) => (
          <CountrySection country={item} ownedIds={ownedIds} onToggle={toggleSticker} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Header({ stats, progressPercent }: { stats: { owned: number; total: number }; progressPercent: number }) {
  return (
    <Gradient colors={HEADER_GRADIENT} angle={135} style={styles.header}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerInner}>
          <View style={styles.titleRow}>
            <View style={styles.logoMark}>
              <Ionicons name="football" size={22} color={C.bg} />
            </View>
            <View>
              <Text style={styles.title}>Meu Álbum</Text>
              <Text style={styles.subtitle}>Copa do Mundo 2026</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBox value={String(stats.owned)} label="coletadas" />
            <StatBox value={String(stats.total - stats.owned)} label="faltando" />
            <StatBox value={`${Math.round(progressPercent)}%`} label="completo" accent />
          </View>

          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </SafeAreaView>
    </Gradient>
  );
}

function StatBox({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, accent && { color: C.accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CountrySection({ country, ownedIds, onToggle }: {
  country: Country;
  ownedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const owned = country.stickers.filter((s) => ownedIds[s.id]).length;
  const total = country.stickers.length;
  const complete = owned === total && total > 0;
  const grad = countryGradient(country.code);

  return (
    <Gradient colors={grad} angle={120} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.flag}>{country.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.countryName}>{country.name}</Text>
          {country.group ? <Text style={styles.group}>Grupo {country.group}</Text> : null}
        </View>
        {complete ? (
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark-circle" size={14} color={C.success} />
            <Text style={styles.completeText}>completo</Text>
          </View>
        ) : (
          <Text style={styles.count}>{owned}/{total}</Text>
        )}
      </View>
      <View style={styles.grid}>
        {country.stickers.map((s) => (
          <StickerChip
            key={s.id}
            sticker={s}
            owned={Boolean(ownedIds[s.id])}
            onToggle={onToggle}
          />
        ))}
      </View>
    </Gradient>
  );
}

function StickerChip({ sticker, owned, onToggle }: { sticker: Sticker; owned: boolean; onToggle: (id: string) => void }) {
  return (
    <Pressable
      onPress={() => onToggle(sticker.id)}
      style={[styles.chip, owned && styles.chipOwned]}
    >
      {owned ? (
        <Ionicons name="checkmark" size={18} color={C.success} />
      ) : (
        <Text style={styles.chipNum}>{sticker.number === 0 ? '00' : sticker.number}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { paddingBottom: 120 },

  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  headerInner: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoMark: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  barBg: { height: 5, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.accent, borderRadius: 3 },

  section: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: C.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: C.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  flag: { fontSize: 24 },
  countryName: { fontSize: 15, fontWeight: '700', color: C.text },
  group: { fontSize: 10, color: C.accent, fontWeight: '600', marginTop: 1 },
  count: { fontSize: 13, color: C.textMuted, fontVariant: ['tabular-nums'], fontWeight: '600' },
  completeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(74,222,128,0.14)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  completeText: { fontSize: 11, color: C.success, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  chipOwned: { borderColor: C.success, backgroundColor: 'rgba(74,222,128,0.15)' },
  chipNum: { fontSize: 14, fontWeight: '700', color: C.textMuted },
});
