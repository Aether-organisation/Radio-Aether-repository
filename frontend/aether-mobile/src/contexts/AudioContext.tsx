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
  loadNearestStation: () => Promise<void>;
  unload: () => Promise<void>;
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
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStation(null);
  };

  const playStation = async (station: RadioStation) => {
    await unload();
    setLoading(true);
    try {
      setCurrentStation(station);
      const { sound } = await Audio.Sound.createAsync(
        { uri: station.streamUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying || false);
        } else if (status.error) {
          console.error(`Player error: ${status.error}`);
        }
      });
    } catch (error) {
      console.error('Error loading stream:', error);
    } finally {
      setLoading(false);
    }
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
      await playStation(res.data);
      setLocationStatus('Ubicación sintonizada');
    } catch (error) {
      console.error('Load nearest error:', error);
      setLocationStatus('Error - Modo sin GPS');
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
      togglePlayback,
      loadNearestStation,
      unload
    }}>
      {children}
    </AudioContext.Provider>
  );
};

