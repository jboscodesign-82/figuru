import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlbumPage } from '@/types';
import { CountrySection } from './CountrySection';
import { C } from '@/constants/colors';

interface Props {
  page: AlbumPage;
  ownedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function PageCard({ page, ownedIds, onToggle }: Props) {
  const total = page.countries.reduce((acc, c) => acc + c.stickers.length, 0);
  const owned = page.countries.reduce(
    (acc, c) => acc + c.stickers.filter((s) => ownedIds[s.id]).length,
    0,
  );

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <Text style={styles.pageLabel}>Página {page.number}</Text>
        <Text style={styles.pageCount}>
          {owned}/{total}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${total > 0 ? (owned / total) * 100 : 0}%` },
          ]}
        />
      </View>

      {/* Countries */}
      {page.countries.map((country) => (
        <CountrySection
          key={country.code}
          country={country}
          ownedIds={ownedIds}
          onToggle={onToggle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: C.textMuted,
  },
  pageCount: {
    fontSize: 12,
    color: C.textMuted,
    fontVariant: ['tabular-nums'],
  },
  barBg: {
    height: 3,
    backgroundColor: C.surface2,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: C.accent,
    borderRadius: 2,
  },
});
