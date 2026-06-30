import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import useAlbumStore from '@/store/useAlbumStore';

export function useAlbum() {
  const { pages, ownedIds, toggleSticker, markOwned, isOwned, getStats, reset } =
    useAlbumStore();

  const stats = getStats();
  const progressPercent = stats.total > 0 ? (stats.owned / stats.total) * 100 : 0;

  const handleToggle = useCallback(
    (stickerId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleSticker(stickerId);
    },
    [toggleSticker],
  );

  return {
    pages,
    ownedIds,
    isOwned,
    toggleSticker: handleToggle,
    markOwned,
    stats,
    progressPercent,
    reset,
  };
}
