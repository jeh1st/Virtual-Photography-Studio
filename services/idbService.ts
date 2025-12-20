
import Dexie, { Table } from 'dexie';
import { SubjectProfile, StudioImage } from '../types';

export class AppDatabase extends Dexie {
  gallery!: Table<StudioImage>;
  library!: Table<StudioImage>; // Uploaded/Base assets
  subjects!: Table<SubjectProfile>;

  constructor() {
    super('ArtisticPortraitDB');
    (this as any).version(2).stores({
      gallery: '++id, prompt, isPrivate',
      library: '++id, prompt, isPrivate',
      subjects: 'id, name'
    });
  }
}

export const db = new AppDatabase();
