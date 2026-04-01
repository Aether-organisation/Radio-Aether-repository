import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LibraryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Library</Text>
      <Text style={styles.subtitle}>Your favorite stations</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});

