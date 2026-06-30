import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAlbumRepository } from './AlbumRepository';

const KEY = 'stickerscan:owned:v1';

/**
 * AsyncStorage-backed repository.
 * Swap with a remote API repository for cloud sync in the future.
 */
export class LocalAlbumRepository implements IAlbumRepository {
  async getOwnedIds(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  async saveOwnedIds(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  }

  async markOwned(newIds: string[]): Promise<void> {
    const current = await this.getOwnedIds();
    const merged = Array.from(new Set([...current, ...newIds]));
    await this.saveOwnedIds(merged);
  }
}
