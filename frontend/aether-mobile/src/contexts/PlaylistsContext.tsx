import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api/axios';
import { Playlist, RadioStation } from '../types';

interface PlaylistsContextType {
  playlists: Playlist[];
  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addStationToPlaylist: (playlistId: string, station: RadioStation) => Promise<void>;
  removeStationFromPlaylist: (playlistId: string, stationId: string) => Promise<void>;
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export const usePlaylists = () => {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistsProvider');
  return ctx;
};

export const PlaylistsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      const res = await api.get('/api/playlists');
      setPlaylists(res.data);
    } catch {
      // no SQLite fallback — keep current in-memory state
    }
  }, []);

  const createPlaylist = useCallback(async (name: string): Promise<Playlist> => {
    const res = await api.post<Playlist>('/api/playlists', { name });
    const newPlaylist = res.data;
    setPlaylists(prev => [newPlaylist, ...prev]);
    return newPlaylist;
  }, []);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    try {
      await api.delete(`/api/playlists/${playlistId}`);
    } catch {
      await loadPlaylists();
    }
  }, [loadPlaylists]);

  const addStationToPlaylist = useCallback(async (playlistId: string, station: RadioStation) => {
    const res = await api.post<Playlist>(`/api/playlists/${playlistId}/stations`, {
      stationId: station.id,
      stationName: station.name,
      streamUrl: station.streamUrl,
      logoUrl: station.logoUrl,
      genre: station.genre,
    });
    setPlaylists(prev => prev.map(p => p.id === playlistId ? res.data : p));
  }, []);

  const removeStationFromPlaylist = useCallback(async (playlistId: string, stationId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId
        ? { ...p, stations: p.stations.filter(s => s.stationId !== stationId) }
        : p
    ));
    try {
      await api.delete(`/api/playlists/${playlistId}/stations/${stationId}`);
    } catch {
      await loadPlaylists();
    }
  }, [loadPlaylists]);

  return (
    <PlaylistsContext.Provider value={{
      playlists,
      loadPlaylists,
      createPlaylist,
      deletePlaylist,
      addStationToPlaylist,
      removeStationFromPlaylist,
    }}>
      {children}
    </PlaylistsContext.Provider>
  );
};
