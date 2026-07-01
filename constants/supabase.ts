// ─── Configuração do Supabase ────────────────────────────────────────────────
//
// Cole aqui a URL e a chave "anon public" do seu projeto Supabase.
// Onde achar: painel do Supabase → Project Settings → API.
//   • Project URL  → SUPABASE_URL
//   • anon public  → SUPABASE_ANON_KEY
//
// A chave "anon" é pública por design (pode ir no código do site); quem protege
// seus dados são as políticas RLS do banco. NÃO use a chave "service_role" aqui.
//
// Enquanto estiver em branco, o app funciona só localmente (sem login/nuvem).

export const SUPABASE_URL = 'https://iedmphamgskkjvdhlutz.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_8B1meoUlzN-KU9-yoJOexg_YMZXNMTc';

export const isSupabaseConfigured = () =>
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
