import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '@/services/supabase';
import { isSupabaseConfigured } from '@/constants/supabase';

interface AuthStore {
  ready: boolean;          // sessão inicial já verificada
  session: Session | null;
  user: User | null;
  configured: boolean;

  init: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  ready: false,
  session: null,
  user: null,
  configured: isSupabaseConfigured(),

  init: async () => {
    const sb = getSupabase();
    if (!sb) { set({ ready: true }); return; }

    const { data } = await sb.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, ready: true });

    sb.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password) => {
    const sb = getSupabase();
    if (!sb) return { error: 'Supabase não configurado.' };
    const { data, error } = await sb.auth.signUp({ email: email.trim(), password });
    if (error) return { error: error.message };
    // Se o projeto exige confirmação de e-mail, não há sessão ainda.
    const needsConfirm = !data.session;
    return { needsConfirm };
  },

  signIn: async (email, password) => {
    const sb = getSupabase();
    if (!sb) return { error: 'Supabase não configurado.' };
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    set({ session: null, user: null });
  },
}));

export default useAuthStore;
