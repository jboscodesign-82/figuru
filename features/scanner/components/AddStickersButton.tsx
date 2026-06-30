import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  count: number;
  onPress: () => void;
}

export function AddStickersButton({ count, onPress }: Props) {
  if (count === 0) return null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.btn}>
      <Text style={styles.icon}>⭐</Text>
      <Text style={styles.text}>
        Adicionar {count} figurinha{count !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentBlue,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    shadowColor: C.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
