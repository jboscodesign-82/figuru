import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Sticker } from '@/types';
import { C } from '@/constants/colors';

interface Props {
  sticker: Sticker;
  owned: boolean;
  onToggle: (id: string) => void;
}

export function StickerToggle({ sticker, owned, onToggle }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onToggle(sticker.id)}
      style={[styles.chip, owned && styles.chipOwned]}
    >
      <Text style={[styles.number, owned && styles.numberOwned]}>
        {owned ? '✓' : sticker.number}
      </Text>
      <Text style={[styles.name, owned && styles.nameOwned]} numberOfLines={1}>
        {sticker.playerName.split(' ').pop()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 70,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
    margin: 4,
  },
  chipOwned: {
    borderColor: C.success,
    backgroundColor: 'rgba(74,222,128,0.12)',
  },
  number: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
  },
  numberOwned: {
    color: C.success,
  },
  name: {
    fontSize: 9,
    color: C.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  nameOwned: {
    color: C.success,
  },
});
