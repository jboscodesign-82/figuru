import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlbumPage } from '@/types';
import { useAlbum } from './useAlbum';
import { PageCard } from './components/PageCard';
import { C } from '@/constants/colors';

export function AlbumScreen() {
  const { pages, ownedIds, toggleSticker, stats, progressPercent } = useAlbum();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={pages}
        keyExtractor={(item: AlbumPage) => String(item.number)}
        ListHeaderComponent={<Header stats={stats} progressPercent={progressPercent} />}
        renderItem={({ item }: { item: AlbumPage }) => (
          <PageCard page={item} ownedIds={ownedIds} onToggle={toggleSticker} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function Header({
  stats,
  progressPercent,
}: {
  stats: { owned: number; total: number };
  progressPercent: number;
}) {
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  list: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 2,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
  statLabel: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  barBg: {
    height: 4,
    backgroundColor: C.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: C.accent,
    borderRadius: 2,
  },
});
