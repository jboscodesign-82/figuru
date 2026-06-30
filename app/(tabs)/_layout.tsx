import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs, router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '@/constants/colors';

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isAlbum = pathname === '/' || pathname === '/index';
  const isSettings = pathname === '/settings';

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {/* Album tab */}
      <Pressable
        style={styles.tabItem}
        onPress={() => router.push('/')}
        
      >
        <Text style={[styles.tabIcon, isAlbum && styles.tabIconActive]}>📋</Text>
        <Text style={[styles.tabLabel, isAlbum && styles.tabLabelActive]}>
          Meu Álbum
        </Text>
      </Pressable>

      {/* Scanner FAB (center) */}
      <View style={styles.fabWrapper}>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/scanner')}
          
        >
          <Text style={styles.fabIcon}>📷</Text>
        </Pressable>
        <Text style={styles.fabLabel}>Escanear</Text>
      </View>

      {/* Settings tab */}
      <Pressable
        style={styles.tabItem}
        onPress={() => router.push('/settings')}
        
      >
        <Text style={[styles.tabIcon, isSettings && styles.tabIconActive]}>⚙️</Text>
        <Text style={[styles.tabLabel, isSettings && styles.tabLabelActive]}>
          Configurações
        </Text>
      </Pressable>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
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
