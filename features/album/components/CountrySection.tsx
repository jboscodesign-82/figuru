import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Country } from '@/types';
import { StickerToggle } from './StickerToggle';
import { C } from '@/constants/colors';

interface Props {
  country: Country;
  ownedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function CountrySection({ country, ownedIds, onToggle }: Props) {
  const owned = country.stickers.filter((s) => ownedIds[s.id]).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.flag}>{country.flag}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{country.name}</Text>
          {country.group ? (
            <Text style={styles.group}>Grupo {country.group}</Text>
          ) : null}
        </View>
        <Text style={styles.count}>
          {owned}/{country.stickers.length}
        </Text>
      </View>
      <View style={styles.grid}>
        {country.stickers.map((sticker) => (
          <StickerToggle
            key={sticker.id}
            sticker={sticker}
            owned={Boolean(ownedIds[sticker.id])}
            onToggle={onToggle}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  flag: {
    fontSize: 20,
  },
  nameRow: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  group: {
    fontSize: 10,
    color: C.accent,
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
    color: C.textMuted,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
});
