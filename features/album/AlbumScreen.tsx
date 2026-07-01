import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlbum } from './useAlbum';
import { Gradient } from '@/components/Gradient';
import { C, HEADER_GRADIENT, countryGradient } from '@/constants/colors';
import type { Country, Sticker } from '@/types';

export function AlbumScreen() {
  const { pages, ownedIds, toggleSticker, stats, progressPercent } = useAlbum();

  const countries = useMemo(
    () => pages.flatMap((p) => p.countries),
    [pages],
  );

  return (
    <View style={styles.safe}>
      <FlatList
        data={countries}
        keyExtractor={(c: Country) => c.code}
        ListHeaderComponent={<Header stats={stats} progressPercent={progressPercent} />}
        renderItem={({ item, index }: { item: Country; index: number }) => (
          <Reveal delay={(index % 6) * 80}>
            <CountrySection country={item} ownedIds={ownedIds} onToggle={toggleSticker} />
          </Reveal>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Header({ stats, progressPercent }: { stats: { owned: number; total: number }; progressPercent: number }) {
  return (
    <Gradient colors={HEADER_GRADIENT} angle={135} style={styles.header}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerInner}>
          <View style={styles.titleRow}>
            <View style={styles.logoMark}>
              <Ionicons name="football" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>Meu Álbum</Text>
              <Text style={styles.subtitle}>Copa do Mundo 2026</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBox value={String(stats.owned)} label="coletadas" />
            <StatBox value={String(stats.total - stats.owned)} label="faltando" />
            <StatBox value={`${Math.round(progressPercent)}%`} label="completo" accent />
          </View>

          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </SafeAreaView>
    </Gradient>
  );
}

function StatBox({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, accent && { color: C.accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Anima o card surgindo (fade + leve subida) quando entra na tela ao rolar.
// O delay em cascata faz os blocos aparecerem gradativamente.
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function CountrySection({ country, ownedIds, onToggle }: {
  country: Country;
  ownedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const owned = country.stickers.filter((s) => ownedIds[s.id]).length;
  const total = country.stickers.length;
  const complete = owned === total && total > 0;
  const grad = countryGradient(country.code);

  return (
    <Gradient colors={grad} angle={120} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.flag}>{country.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.countryName}>{country.name}</Text>
          {country.group ? <Text style={styles.group}>Grupo {country.group}</Text> : null}
        </View>
        {complete ? (
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark-circle" size={16} color={C.success} />
            <Text style={styles.completeText}>completo</Text>
          </View>
        ) : (
          <Text style={styles.count}>{owned}/{total}</Text>
        )}
      </View>
      <View style={styles.grid}>
        {country.stickers.map((s) => (
          <StickerChip
            key={s.id}
            sticker={s}
            owned={Boolean(ownedIds[s.id])}
            onToggle={onToggle}
          />
        ))}
      </View>
    </Gradient>
  );
}

function StickerChip({ sticker, owned, onToggle }: { sticker: Sticker; owned: boolean; onToggle: (id: string) => void }) {
  return (
    <Pressable
      onPress={() => onToggle(sticker.id)}
      style={[styles.chip, owned && styles.chipOwned]}
    >
      <Text style={[styles.chipNum, owned && styles.chipNumOwned]}>
        {sticker.number === 0 ? '00' : sticker.number}
      </Text>
      {owned && (
        <View style={styles.chipCheck}>
          <Ionicons name="checkmark" size={13} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { paddingBottom: 120 },

  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  headerInner: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoMark: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  barBg: { height: 5, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.accent, borderRadius: 3 },

  section: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: C.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: C.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  flag: { fontSize: 36 },
  countryName: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  group: { fontSize: 13, color: C.accent, fontWeight: '600', marginTop: 2 },
  count: { fontSize: 16, color: C.textMuted, fontVariant: ['tabular-nums'], fontWeight: '700' },
  completeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(74,222,128,0.14)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  completeText: { fontSize: 13, color: C.success, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: {
    width: 54, height: 54, borderRadius: 13,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  chipOwned: { borderColor: '#ffffff', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  chipNum: { fontSize: 19, fontWeight: '700', color: C.textMuted },
  chipNumOwned: { color: '#ffffff', fontWeight: '800' },
  chipCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
