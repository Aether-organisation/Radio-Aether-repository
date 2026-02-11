import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import api from '../api/axios';
import { RadioStation } from '../types';
import * as SecureStore from 'expo-secure-store';

export const PlayerScreen = ({ navigation }: any) => {
  const [station, setStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: Audio.INTERRUPTION_MODE_IOS_DUCKOTHERS,
      });
    };
    setupAudio();
  }, []);

  useEffect(() => {
    loadRadioData();
  }, []);

  const loadRadioData = async () => {
    try {
      const res = await api.get('/api/radio/mock');
      setStation(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupPlayer = async () => {
      if (station && station.streamUrl) {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
          }
          
          const { sound } = await Audio.Sound.createAsync(
            { uri: station.streamUrl },
            { shouldPlay: true }
          );
          
          soundRef.current = sound;

          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          });

          await sound.playAsync();
        } catch (error) {
          console.error('Error setting up audio player:', error);
        }
      }
    };

    setupPlayer();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [station?.streamUrl]);

  const togglePlayback = async () => {
    if (!soundRef.current) return;
    
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleLogout = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    await SecureStore.deleteItemAsync('jwt_token');
    navigation.replace('Login');
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#646cff" /></View>;
  if (!station) return <View style={styles.container}><Text style={styles.text}>No signal.</Text></View>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: station.logoUrl }} style={styles.logo} />
      
      <Text style={styles.stationName}>{station.name}</Text>
      <Text style={styles.genre}>{station.genre}</Text>

      <TouchableOpacity 
        style={styles.playButton} 
        onPress={togglePlayback}
      >
        <Text style={styles.playIcon}>{isPlaying ? "⏸️" : "▶️"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={{color: 'red'}}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 200, height: 200, borderRadius: 20, marginBottom: 30 },
  stationName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  genre: { color: '#888', fontSize: 18, marginBottom: 40 },
  playButton: { backgroundColor: '#222', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  playIcon: { fontSize: 30 },
  logoutBtn: { marginTop: 50 },
  text: { color: 'white' }
});

