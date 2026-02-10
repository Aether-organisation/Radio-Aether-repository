import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import api from '../api/axios';
import { RadioStation } from '../types';
import * as SecureStore from 'expo-secure-store';

export const PlayerScreen = ({ navigation }: any) => {
  const [station, setStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const playerRef = React.useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
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
    if (station && station.streamUrl) {
      if (playerRef.current) {
        playerRef.current.remove();
      }
      
      const player = createAudioPlayer({
        uri: station.streamUrl,
      });
      
      playerRef.current = player;

      player.play();

      const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
        if (status.isLoaded) {
          setIsPlaying(status.playing);
        }
      });

      return () => {
        subscription.remove();
        player.remove();
      };
    }
  }, [station?.streamUrl]);

  const togglePlayback = async () => {
    if (!playerRef.current) return;
    
    const status = playerRef.current.currentStatus;
    if (status.playing) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLogout = async () => {
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
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

