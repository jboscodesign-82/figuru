import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlbumPage } from '@/types';
import albumData from '@/assets/data/stickers.json';

interface AlbumStore {
  pages: AlbumPage[];
  /** Flat map stickerId → true for O(1) lookup */
  ownedIds: Record<string, boolean>;

  toggleSticker: (stickerId: string) => void;
  markOwned: (stickerIds: string[]) => void;
  setOwned: (ownedIds: Record<string, boolean>) => void;
  isOwned: (stickerId: string) => boolean;
  getStats: () => { owned: number; total: number };
  reset: () => void;
}

const useAlbumStore = create<AlbumStore>()(
  persist(
    (set, get) => ({
      pages: albumData.pages as AlbumPage[],
      ownedIds: {},

      toggleSticker: (stickerId) =>
        set((state) => {
          const owned = { ...state.ownedIds };
          if (owned[stickerId]) delete owned[stickerId];
          else owned[stickerId] = true;
          return { ownedIds: owned };
        }),

      markOwned: (stickerIds) =>
        set((state) => {
          const owned = { ...state.ownedIds };
          stickerIds.forEach((id) => { owned[id] = true; });
          return { ownedIds: owned };
        }),

      setOwned: (ownedIds) => set({ ownedIds: { ...ownedIds } }),

      isOwned: (stickerId) => Boolean(get().ownedIds[stickerId]),

      getStats: () => {
        const { pages, ownedIds } = get();
        const total = pages.reduce(
          (acc, page) => acc + page.countries.reduce((a, c) => a + c.stickers.length, 0),
          0,
        );
        return { owned: Object.keys(ownedIds).length, total };
      },

      reset: () => set({ ownedIds: {} }),
    }),
    {
      name: 'stickerscan-album-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ownedIds: state.ownedIds }),
    },
  ),
);

export default useAlbumStore;
