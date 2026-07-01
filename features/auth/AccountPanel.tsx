import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '@/store/useAuthStore';
import { C } from '@/constants/colors';

export function AccountPanel() {
  const { configured, user, signIn, signUp, signOut } = useAuthStore();

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!configured) {
    return (
      <View style={styles.card}>
        <View style={styles.notice}>
          <Ionicons name="cloud-offline-outline" size={20} color={C.textMuted} />
          <Text style={styles.noticeText}>
            Login na nuvem ainda não configurado. Suas marcações estão salvas só neste aparelho.
          </Text>
        </View>
      </View>
    );
  }

  // Logado
  if (user) {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
            <Text style={styles.synced}>
              <Ionicons name="cloud-done-outline" size={12} color={C.success} /> Sincronizado na nuvem
            </Text>
          </View>
        </View>
        <Pressable style={styles.logoutBtn} onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={17} color={C.textMuted} />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>
    );
  }

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError('Informe um e-mail válido e senha de ao menos 6 caracteres.');
      return;
    }
    setBusy(true);
    const res = mode === 'in'
      ? await signIn(email, password)
      : await signUp(email, password);
    setBusy(false);

    if (res.error) { setError(res.error); return; }
    if (mode === 'up' && (res as any).needsConfirm) {
      setInfo('Conta criada! Confirme o e-mail que enviamos e depois entre.');
      setMode('in');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, mode === 'in' && styles.tabActive]}
          onPress={() => { setMode('in'); setError(null); setInfo(null); }}
        >
          <Text style={[styles.tabText, mode === 'in' && styles.tabTextActive]}>Entrar</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, mode === 'up' && styles.tabActive]}
          onPress={() => { setMode('up'); setError(null); setInfo(null); }}
        >
          <Text style={[styles.tabText, mode === 'up' && styles.tabTextActive]}>Criar conta</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        placeholderTextColor={C.textDim}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="senha (mín. 6 caracteres)"
        placeholderTextColor={C.textDim}
        secureTextEntry
        autoCapitalize="none"
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {info && <Text style={styles.info}>{info}</Text>}

      <Pressable style={[styles.submit, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        {busy
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>{mode === 'in' ? 'Entrar' : 'Criar conta'}</Text>}
      </Pressable>

      <Text style={styles.hint}>
        Com uma conta, suas figurinhas ficam salvas na nuvem e sincronizam entre aparelhos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  noticeText: { flex: 1, color: C.textMuted, fontSize: 13, lineHeight: 18 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
  },
  email: { color: C.text, fontSize: 15, fontWeight: '700' },
  synced: { color: C.success, fontSize: 12, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 12, marginTop: 4,
  },
  logoutText: { color: C.textMuted, fontWeight: '700', fontSize: 14 },

  tabs: {
    flexDirection: 'row', backgroundColor: C.surface2, borderRadius: 10, padding: 4, gap: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 8 },
  tabActive: { backgroundColor: C.accent },
  tabText: { color: C.textMuted, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#fff' },

  input: {
    backgroundColor: C.surface2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  error: { color: C.danger, fontSize: 13 },
  info: { color: C.success, fontSize: 13 },
  submit: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  hint: { color: C.textMuted, fontSize: 12, lineHeight: 17 },
});
