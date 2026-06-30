export interface IAlbumRepository {
  getOwnedIds(): Promise<string[]>;
  saveOwnedIds(ids: string[]): Promise<void>;
  /** Merge newIds with whatever is already stored */
  markOwned(newIds: string[]): Promise<void>;
}
