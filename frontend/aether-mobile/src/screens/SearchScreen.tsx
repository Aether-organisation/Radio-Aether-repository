import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAudio } from '../contexts/AudioContext';

export const SearchScreen = () => {
  const { loadNearestStation, loading } = useAudio();

  const handleFindNearest = () => {
    loadNearestStation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search stations..."
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.nearestButton} onPress={handleFindNearest} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.nearestButtonText}>📍 Radio Cercana (GPS)</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.subtitle}>Busca estaciones locales por GPS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  nearestButton: {
    backgroundColor: '#646cff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  nearestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
});


