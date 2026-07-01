import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';

// Fallback nativo — sem dependência de expo-linear-gradient.
// Usa a primeira cor como base sólida. (App é web-first; ver Gradient.web.tsx)
export function Gradient({
  colors,
  style,
  children,
  ...rest
}: {
  colors: readonly string[];
  angle?: number;
  style?: StyleProp<ViewStyle>;
} & ViewProps) {
  return (
    <View style={[{ backgroundColor: colors[0] as string }, style]} {...rest}>
      {children}
    </View>
  );
}
