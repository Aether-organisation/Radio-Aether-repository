import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { RadioStation } from '../types';

export const MiniPlayer = () => {
  const { currentStation, isPlaying, togglePlayback } = useAudio();

  if (!currentStation) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentStation.logoUrl || 'https://via.placeholder.com/50' }} style={styles.logo} />
      <View style={styles.info}>
        <Text style={styles.stationName} numberOfLines={1}>{currentStation.name}</Text>
        <Text style={styles.genre} numberOfLines={1}>{currentStation.genre}</Text>
      </View>
      <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
        <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above tab bar (typical height 83px + padding)
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    zIndex: 1000,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  stationName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  genre: {
    color: '#888',
    fontSize: 12,
  },
  playButton: {
    padding: 5,
  },
  playIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

