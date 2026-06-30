import { create } from 'zustand';
import { DetectedSticker } from '@/types';

interface ScannerStore {
  detectedStickers: DetectedSticker[];
  newStickers: DetectedSticker[];
  updateDetections: (stickers: DetectedSticker[]) => void;
  clearDetections: () => void;
}

const useScannerStore = create<ScannerStore>((set) => ({
  detectedStickers: [],
  newStickers: [],

  updateDetections: (stickers) =>
    set({
      detectedStickers: stickers,
      newStickers: stickers.filter((s) => !s.isOwned),
    }),

  clearDetections: () => set({ detectedStickers: [], newStickers: [] }),
}));

export default useScannerStore;
