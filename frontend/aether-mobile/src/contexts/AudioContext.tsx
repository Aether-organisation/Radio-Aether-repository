import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import api from '../api/axios';
import { RadioStation } from '../types';

interface AudioContextType {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  loading: boolean;
  locationStatus: string;
  playStation: (station: RadioStation) => Promise<void>;
  togglePlayback: () => Promise<void>;
  tryPlaySequence: (stations: RadioStation[]) => Promise<void>;
  loadNearestStation: () => Promise<void>;
  unload: () => Promise<void>;
  error: string | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Ready');
  const [error, setError] = useState<string | null>(null);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Audio session setup error:', e);
      }
    };
    setupAudio();
  }, []);

  const unload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.warn('Unload error:', e);
      }
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStation(null);
    setError(null);
  };

  const tryPlaySequence = async (stations: RadioStation[]) => {
    await unload();
    setLoading(true);
    setError(null);
    let sequenceSuccess = false;

    for (const station of stations) {
      try {
        setCurrentStation(station);
        const { sound } = await Audio.Sound.createAsync(
          { 
            uri: station.streamUrl,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
              'Accept': 'audio/mpeg, audio/aac, audio/*;q=0.9, */*;q=0.8'
            }
          },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);
        sequenceSuccess = true;
        
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying || false);
          } else if (status.error) {
            setError("Error en la reproducción del stream");
            setIsPlaying(false);
          }
        });
        break;
      } catch (err) {
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      }
    }

    if (!sequenceSuccess) {
      setError("No se pudo conectar con ninguna emisora");
      setCurrentStation(null);
    }
    setLoading(false);
  };

  const playStation = async (station: RadioStation) => {
    await tryPlaySequence([station]);
  };

  const togglePlayback = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
      }
    } catch (error) {
      console.error('Toggle playback error:', error);
    }
  };

  const loadNearestStation = async () => {
    setLoading(true);
    setLocationStatus('Buscando GPS...');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('GPS denegado');
        setLoading(false);
        return;
      }

      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
      } catch (locationError) {
        console.warn("Highest failed, trying Low...", locationError);
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
      }

      const { latitude, longitude } = location.coords;
      setLocationStatus('Sintonizando zona...');

      const res = await api.post('/api/radio/nearest', {
        latitude,
        longitude
      });
      await tryPlaySequence(res.data);
      setLocationStatus('Ubicación sintonizada');
    } catch (error: any) {
      console.error('Load nearest error:', error);
      const errorMsg = error.response?.data?.message || "No hay radios cercanas disponibles";
      setError(errorMsg);
      setLocationStatus('Error local');
      setLoading(false);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentStation,
      isPlaying,
      loading,
      locationStatus,
      playStation,
      tryPlaySequence,
      togglePlayback,
      loadNearestStation,
      unload,
      error
    }}>
      {children}
    </AudioContext.Provider>
  );
};

