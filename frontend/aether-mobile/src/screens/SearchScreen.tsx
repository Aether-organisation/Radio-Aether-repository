import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const SearchScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search stations..."
        placeholderTextColor="#888"
      />
      <Text style={styles.subtitle}>Search radio stations</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
});

