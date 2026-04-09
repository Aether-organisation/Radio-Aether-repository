import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { RadioStation } from '../types';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

export const PlayerScreen = () => {
  const { currentStation, isPlaying, loading, locationStatus, togglePlayback, unload, error } = useAudio();
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await unload();
    await SecureStore.deleteItemAsync('jwt_token');
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#646cff" />
        <Text style={styles.loadingText}>{locationStatus}</Text>
      </View>
    );
  }

  if (!currentStation) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSignalText}>No hay señal de radio</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentStation.logoUrl || 'https://via.placeholder.com/200' }} style={styles.logo} />
      <Text style={styles.stationName}>{currentStation.name}</Text>
      <Text style={styles.genre}>{currentStation.genre}</Text>
      <Text style={styles.locationTag}>{locationStatus}</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.debugText}>ID: {currentStation.id?.substring(0,8) || '???'}</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  noSignalText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 30,
    backgroundColor: '#222',
  },
  stationName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  genre: {
    color: '#888',
    fontSize: 18,
    marginBottom: 5,
  },
  locationTag: {
    color: '#646cff',
    fontSize: 14,
    marginBottom: 30,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playButton: {
    backgroundColor: '#222',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  playIcon: {
    fontSize: 30,
    color: 'white',
  },
  debugText: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    color: '#333',
    fontSize: 10,
  },
  logoutBtn: {
    marginTop: 50,
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'red',
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

