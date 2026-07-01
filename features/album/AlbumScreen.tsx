import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlbum } from './useAlbum';
import { C } from '@/constants/colors';
import type { Country, Sticker } from '@/types';

export function AlbumScreen() {
  const { pages, ownedIds, toggleSticker, stats, progressPercent } = useAlbum();

  const countries = useMemo(
    () => pages.flatMap((p) => p.countries),
    [pages],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
    </SafeAreaView>
  );
}

function Header({ stats, progressPercent }: { stats: { owned: number; total: number }; progressPercent: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Meu Álbum</Text>
      <Text style={styles.subtitle}>Copa do Mundo 2026</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.owned}</Text>
          <Text style={styles.statLabel}>coletadas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total - stats.owned}</Text>
          <Text style={styles.statLabel}>faltando</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: C.accent }]}>
            {Math.round(progressPercent)}%
          </Text>
          <Text style={styles.statLabel}>completo</Text>
        </View>
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
      </View>
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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.flag}>{country.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.countryName}>{country.name}</Text>
          {country.group ? <Text style={styles.group}>Grupo {country.group}</Text> : null}
        </View>
        <Text style={styles.count}>{owned}/{total}</Text>
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
    </View>
  );
}

function StickerChip({ sticker, owned, onToggle }: { sticker: Sticker; owned: boolean; onToggle: (id: string) => void }) {
  return (
    <Pressable
      onPress={() => onToggle(sticker.id)}
      style={[styles.chip, owned && styles.chipOwned]}
    >
      <Text style={[styles.chipNum, owned && styles.chipNumOwned]}>
        {owned ? '✓' : sticker.number === 0 ? '00' : sticker.number}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { paddingBottom: 100 },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: C.textMuted, marginTop: 2, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  barBg: { height: 4, backgroundColor: C.surface2, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.accent, borderRadius: 2 },

  section: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: C.surface, borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: C.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  flag: { fontSize: 22 },
  countryName: { fontSize: 14, fontWeight: '700', color: C.text },
  group: { fontSize: 10, color: C.accent, fontWeight: '600' },
  count: { fontSize: 12, color: C.textMuted, fontVariant: ['tabular-nums'] },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    width: 38, height: 38, borderRadius: 8,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  chipOwned: { borderColor: C.success, backgroundColor: 'rgba(74,222,128,0.15)' },
chipNum: { fontSize: 13, fontWeight: '700', color: C.textMuted },
  chipNumOwned: { color: C.success },
});
