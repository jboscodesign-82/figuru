export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Sticker {
  id: string;
  number: number;
  playerName: string;
  position: Position;
  imageUrl?: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  stickers: Sticker[];
}

export interface AlbumPage {
  number: number;
  countries: Country[];
}

export interface BoundingBox {
  /** All values 0–1, relative to frame dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedSticker {
  stickerId: string;
  number: number;
  country: string;
  playerName: string;
  confidence: number;
  boundingBox: BoundingBox;
  isOwned: boolean;
}

// ─── Service interfaces ───────────────────────────────────────────────────────
// All consumers depend on these — swap any implementation without touching
// the rest of the codebase.

export interface IStickerRecognizer {
  /** REPLACE frame type with Frame from react-native-vision-camera in production */
  recognize(frame: unknown): Promise<DetectedSticker[]>;
}

export interface IOCRProvider {
  /** Extract raw text (e.g. "BRA042") from a camera frame */
  extractText(frame: unknown): Promise<string>;
}

export interface IDetectionProvider {
  /** Locate rectangular sticker regions in a frame */
  detectRegions(frame: unknown): Promise<BoundingBox[]>;
}

export interface IAlbumRepository {
  getOwnedIds(): Promise<string[]>;
  saveOwnedIds(ids: string[]): Promise<void>;
  markOwned(newIds: string[]): Promise<void>;
}

export interface IImageMatcher {
  /** Returns confidence 0–1 that frame matches a given sticker template */
  match(frame: unknown, templateId: string): Promise<number>;
}
