import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '@/constants/colors';

function TabBarIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{label}</Text>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {/* Album tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('index')}
        activeOpacity={0.7}
      >
        <TabBarIcon label="📋" focused={state.index === 0} />
        <Text style={[styles.tabLabel, state.index === 0 && styles.tabLabelActive]}>
          Meu Álbum
        </Text>
      </TouchableOpacity>

      {/* Scanner FAB (center) */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/scanner')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>📷</Text>
        </TouchableOpacity>
        <Text style={styles.fabLabel}>Escanear</Text>
      </View>

      {/* Settings tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('settings')}
        activeOpacity={0.7}
      >
        <TabBarIcon label="⚙️" focused={state.index === 1} />
        <Text style={[styles.tabLabel, state.index === 1 && styles.tabLabelActive]}>
          Configurações
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: C.accent,
  },
  fabWrapper: {
    alignItems: 'center',
    gap: 3,
    marginTop: -24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 26,
  },
  fabLabel: {
    fontSize: 10,
    color: C.accentBlue,
    fontWeight: '700',
  },
});
