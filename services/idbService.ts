
import Dexie, { Table } from 'dexie';
import { SubjectProfile, StudioImage, GenerationLog } from '../types';

export class AppDatabase extends Dexie {
  gallery!: Table<StudioImage>;
  library!: Table<StudioImage>; // Uploaded/Base assets
  subjects!: Table<SubjectProfile>;
  history!: Table<GenerationLog>;

  constructor() {
    super('ArtisticPortraitDB');
    (this as any).version(3).stores({
      gallery: '++id, prompt, isPrivate',
      library: '++id, prompt, isPrivate',
      subjects: 'id, name',
      history: '++id, timestamp, status'
    });
  }
}

export const db = new AppDatabase();
