import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Sticker } from '@/types';
import { C } from '@/constants/colors';

interface Props {
  sticker: Sticker;
  owned: boolean;
  onToggle: (id: string) => void;
}

export function StickerToggle({ sticker, owned, onToggle }: Props) {
  const isBadge = sticker.type === 'badge';
  const isTeamPhoto = sticker.type === 'team_photo';
  const isSpecial = sticker.type === 'special';
  const isNonPlayer = isBadge || isTeamPhoto || isSpecial;

  const icon = isBadge ? '🛡️' : isTeamPhoto ? '📸' : isSpecial ? '⭐' : null;

  return (
    <Pressable
      
      onPress={() => onToggle(sticker.id)}
      style={[
        styles.chip,
        owned && styles.chipOwned,
        isNonPlayer && styles.chipSpecial,
        owned && isNonPlayer && styles.chipSpecialOwned,
      ]}
    >
      {icon ? (
        <Text style={styles.icon}>{owned ? '✓' : icon}</Text>
      ) : (
        <Text style={[styles.number, owned && styles.numberOwned]}>
          {owned ? '✓' : sticker.number}
        </Text>
      )}
      <Text style={[styles.name, owned && styles.nameOwned]} numberOfLines={1}>
        {isNonPlayer
          ? sticker.playerName
          : sticker.playerName.split(' ').pop()}
      </Text>
    </Pressable>
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
  chipSpecial: {
    borderColor: C.accent,
    backgroundColor: 'rgba(255,215,0,0.08)',
    width: 80,
  },
  chipSpecialOwned: {
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
  icon: {
    fontSize: 16,
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
