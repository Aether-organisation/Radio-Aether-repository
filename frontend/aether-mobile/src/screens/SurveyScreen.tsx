import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axios';

const genres = [
  'Rock',
  'Pop',
  'Jazz',
  'Electronic',
  'Classical',
  'Hip-Hop',
  'Country',
  'Metal',
  'Reggae',
  'Punk',
  'Indie',
  'Folk',
  'R&B',
  'Blues',
  'Techno'
];

export const SurveyScreen = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const navigation = useNavigation<any>();

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const finishSurvey = async () => {
    try {
      await api.put('/api/user/survey-completed');
    } catch (e) {
      console.error('Error completing survey:', e);
    }
  };

  const handleFinish = async () => {
    if (selectedGenres.length === 0) {
      Alert.alert('Selecciona', 'Selecciona al menos un género');
      return;
    }
    console.log('Selected genres:', selectedGenres);
    await finishSurvey();
    // TODO: Save to backend
    navigation.replace('MainTabs');
  };

  const handleSkip = async () => {
    await finishSurvey();
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 What moves you?</Text>
      <Text style={styles.subtitle}>Select your favorite genres</Text>
      
      <ScrollView style={styles.genreScroll} contentContainerStyle={styles.genreList}>
        {genres.map(genre => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreBubble,
              selectedGenres.includes(genre) && styles.genreBubbleSelected
            ]}
            onPress={() => toggleGenre(genre)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.genreText,
              selectedGenres.includes(genre) && styles.genreTextSelected
            ]}>
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.selectedCount}>
        {selectedGenres.length} genres selected
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  genreScroll: {
    flex: 1,
    marginBottom: 20,
  },
  genreList: {
    paddingBottom: 20,
  },
  genreBubble: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  genreBubbleSelected: {
    backgroundColor: '#646cff',
    borderColor: '#646cff',
  },
  genreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  genreTextSelected: {
    color: '#fff',
  },
  selectedCount: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#646cff',
    borderRadius: 8,
  },
  skipText: {
    color: '#646cff',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#646cff',
    paddingVertical: 15,
    marginLeft: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  finishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

