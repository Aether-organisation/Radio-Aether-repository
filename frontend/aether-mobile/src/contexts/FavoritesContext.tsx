import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api/axios';
import { RadioStation } from '../types';

interface FavoritesContextType {
  favorites: RadioStation[];
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (station: RadioStation) => Promise<void>;
  loadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<RadioStation[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await api.get('/api/favorites');
      setFavorites(res.data);
    } catch (e) {
      console.error('Load favorites error:', e);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (stationId: string) => favorites.some(f => f.id === stationId),
    [favorites]
  );

  const toggleFavorite = useCallback(async (station: RadioStation) => {
    const alreadyFav = favorites.some(f => f.id === station.id);

    // Optimistic update
    if (alreadyFav) {
      setFavorites(prev => prev.filter(f => f.id !== station.id));
    } else {
      setFavorites(prev => [...prev, station]);
    }

    try {
      if (alreadyFav) {
        await api.delete(`/api/favorites/${station.id}`);
      } else {
        await api.post('/api/favorites', {
          stationId: station.id,
          name: station.name,
          streamUrl: station.streamUrl,
          logoUrl: station.logoUrl,
          genre: station.genre,
        });
      }
    } catch (e) {
      // Rollback on error
      console.error('Toggle favorite error:', e);
      if (alreadyFav) {
        setFavorites(prev => [...prev, station]);
      } else {
        setFavorites(prev => prev.filter(f => f.id !== station.id));
      }
    }
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
