import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';

// Gradiente linear via CSS (web). Renderiza um <div> absoluto atrás do conteúdo,
// mantendo o layout normal do React Native Web para os filhos.
export function Gradient({
  colors,
  angle = 180,
  style,
  children,
  ...rest
}: {
  colors: readonly string[];
  angle?: number;
  style?: StyleProp<ViewStyle>;
} & ViewProps) {
  return (
    <View style={[{ overflow: 'hidden' }, style]} {...rest}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(${angle}deg, ${colors.join(', ')})`,
          pointerEvents: 'none',
        }}
      />
      {children}
    </View>
  );
}
