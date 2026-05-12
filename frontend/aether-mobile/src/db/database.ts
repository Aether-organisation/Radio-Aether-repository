import * as SQLite from 'expo-sqlite';
import { RadioStation } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('aether_cache.db');
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS cached_favorites (
      id TEXT PRIMARY KEY,
      name TEXT,
      streamUrl TEXT,
      logoUrl TEXT,
      genre TEXT
    )
  `);
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS cached_home_stations (
      id TEXT PRIMARY KEY,
      name TEXT,
      streamUrl TEXT,
      logoUrl TEXT,
      genre TEXT,
      section TEXT
    )
  `);
}

export async function saveFavorites(stations: RadioStation[]): Promise<void> {
  if (!db) return;
  await db.runAsync('DELETE FROM cached_favorites');
  for (const s of stations) {
    await db.runAsync(
      'INSERT OR REPLACE INTO cached_favorites (id, name, streamUrl, logoUrl, genre) VALUES (?, ?, ?, ?, ?)',
      [s.id, s.name, s.streamUrl, s.logoUrl, s.genre]
    );
  }
}

export async function getFavorites(): Promise<RadioStation[]> {
  if (!db) return [];
  const rows = await db.getAllAsync<RadioStation>('SELECT id, name, streamUrl, logoUrl, genre FROM cached_favorites');
  return rows;
}

export async function saveHomeStations(stations: RadioStation[], section: 'nearest' | 'foryou'): Promise<void> {
  if (!db) return;
  await db.runAsync('DELETE FROM cached_home_stations WHERE section = ?', [section]);
  for (const s of stations) {
    await db.runAsync(
      'INSERT OR REPLACE INTO cached_home_stations (id, name, streamUrl, logoUrl, genre, section) VALUES (?, ?, ?, ?, ?, ?)',
      [s.id, s.name, s.streamUrl, s.logoUrl, s.genre, section]
    );
  }
}

export async function getHomeStations(section: 'nearest' | 'foryou'): Promise<RadioStation[]> {
  if (!db) return [];
  const rows = await db.getAllAsync<RadioStation>(
    'SELECT id, name, streamUrl, logoUrl, genre FROM cached_home_stations WHERE section = ?',
    [section]
  );
  return rows;
}
