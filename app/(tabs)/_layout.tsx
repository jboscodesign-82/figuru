import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs, router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/constants/colors';

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isAlbum = pathname === '/' || pathname === '/index';
  const isSettings = pathname === '/settings';

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
      <View style={styles.pill}>
        {/* Álbum */}
        <Pressable style={styles.tabItem} onPress={() => router.push('/')}>
          <Ionicons
            name={isAlbum ? 'albums' : 'albums-outline'}
            size={23}
            color={isAlbum ? C.accent : C.textMuted}
          />
          <Text style={[styles.tabLabel, isAlbum && styles.tabLabelActive]}>Álbum</Text>
        </Pressable>

        {/* Scanner FAB (centro, elevado) */}
        <View style={styles.fabWrapper}>
          <Pressable style={styles.fab} onPress={() => router.push('/scanner')}>
            <Ionicons name="scan" size={26} color="#00131a" />
          </Pressable>
          <Text style={styles.fabLabel}>Escanear</Text>
        </View>

        {/* Configurações */}
        <Pressable style={styles.tabItem} onPress={() => router.push('/settings')}>
          <Ionicons
            name={isSettings ? 'settings' : 'settings-outline'}
            size={23}
            color={isSettings ? C.accent : C.textMuted}
          />
          <Text style={[styles.tabLabel, isSettings && styles.tabLabelActive]}>Ajustes</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(20,20,28,0.92)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 10,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    width: 64,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    color: C.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: C.accent,
  },
  fabWrapper: {
    alignItems: 'center',
    gap: 4,
    marginTop: -34,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: C.bg,
    shadowColor: C.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  fabLabel: {
    fontSize: 10.5,
    color: C.accentBlue,
    fontWeight: '700',
  },
});
