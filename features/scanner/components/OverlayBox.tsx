import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { DetectedSticker } from '@/types';
import { C } from '@/constants/colors';

const { width: SW, height: SH } = Dimensions.get('window');

interface Props {
  sticker: DetectedSticker;
}

/**
 * Absolute-positioned overlay drawn over the camera view.
 * BoundingBox values are in [0,1] relative to screen dimensions.
 *
 * In production with react-native-vision-camera, convert from frame
 * pixel coordinates to screen coordinates using the frame/screen ratio.
 */
export function OverlayBox({ sticker }: Props) {
  const { boundingBox: b, isOwned, playerName, country, confidence } = sticker;

  const borderColor = isOwned ? C.success : C.accentBlue;
  const bgColor = isOwned ? 'rgba(74,222,128,0.15)' : 'rgba(76,201,240,0.15)';
  const icon = isOwned ? '✓' : '⭐';

  return (
    <View
      style={[
        styles.box,
        {
          left: b.x * SW,
          top: b.y * SH,
          width: b.width * SW,
          height: b.height * SH,
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
    >
      <View style={[styles.label, { backgroundColor: borderColor }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.player} numberOfLines={1}>
          {playerName.split(' ').slice(-1)[0]}
        </Text>
        <Text style={styles.country}>{country}</Text>
      </View>
      <Text style={[styles.confidence, { color: borderColor }]}>
        {Math.round(confidence * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'flex-end',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    gap: 4,
  },
  icon: {
    fontSize: 11,
    color: '#000',
    fontWeight: '700',
  },
  player: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  country: {
    fontSize: 9,
    color: '#00000099',
    fontWeight: '600',
  },
  confidence: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 9,
    fontWeight: '700',
  },
});
