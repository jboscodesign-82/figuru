import { getSupabase } from '@/services/supabase';

// Tabela `collections`:
//   user_id uuid primary key references auth.users
//   owned   jsonb   -- array de stickerIds, ex: ["FRA014","BRA007"]
//   updated_at timestamptz

const TABLE = 'collections';

/** Busca a coleção da nuvem para o usuário logado. null = nenhuma linha ainda. */
export async function fetchCloudCollection(userId: string): Promise<Record<string, boolean> | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from(TABLE)
    .select('owned')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !Array.isArray(data.owned)) return null;

  const map: Record<string, boolean> = {};
  for (const id of data.owned as string[]) map[id] = true;
  return map;
}

/** Grava (upsert) a coleção do usuário na nuvem. */
export async function saveCloudCollection(userId: string, ownedIds: Record<string, boolean>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const owned = Object.keys(ownedIds).filter((k) => ownedIds[k]);
  const { error } = await sb
    .from(TABLE)
    .upsert(
      { user_id: userId, owned, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

  if (error) throw new Error(error.message);
}
