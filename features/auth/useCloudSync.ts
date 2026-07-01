import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/useAuthStore';
import useAlbumStore from '@/store/useAlbumStore';
import { fetchCloudCollection, saveCloudCollection } from '@/services/collectionSync';

// Mescla a coleção da nuvem com a local ao logar e sincroniza mudanças de volta.
export function useCloudSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const mergedForUser = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) Ao logar: baixa nuvem, faz união com o que já está local, grava de volta.
  useEffect(() => {
    if (!userId) { mergedForUser.current = null; return; }
    if (mergedForUser.current === userId) return;

    let cancelled = false;
    (async () => {
      try {
        const cloud = await fetchCloudCollection(userId);
        if (cancelled) return;

        const local = useAlbumStore.getState().ownedIds;
        const merged = { ...(cloud ?? {}), ...local };
        useAlbumStore.getState().setOwned(merged);
        mergedForUser.current = userId;

        // Grava a união (garante que o local vá pra nuvem e vice-versa)
        await saveCloudCollection(userId, merged);
      } catch (e) {
        console.warn('[sync] falha ao mesclar coleção:', e);
        // Ainda marca como mesclado pra não repetir em loop
        mergedForUser.current = userId;
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // 2) Enquanto logado: qualquer mudança em ownedIds sobe pra nuvem (debounce).
  useEffect(() => {
    if (!userId) return;

    const unsub = useAlbumStore.subscribe((state, prev) => {
      if (state.ownedIds === prev.ownedIds) return;
      if (mergedForUser.current !== userId) return; // ainda não terminou o merge inicial

      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        saveCloudCollection(userId, useAlbumStore.getState().ownedIds)
          .catch((e) => console.warn('[sync] falha ao salvar:', e));
      }, 800);
    });

    return () => {
      unsub();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [userId]);
}
