import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location'; 
import api from '../api/axios';
import { RadioStation } from '../types';
import * as SecureStore from 'expo-secure-store';

export const PlayerScreen = ({ navigation }: any) => {
  const [station, setStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>("Iniciando..."); 
  
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
        console.error("Error configurando audio session:", e);
      }
    };
    setupAudio();
  }, []);

  useEffect(() => {
    initRadio();
  }, []);

  const initRadio = async () => {
    setLoading(true);
    setLocationStatus("Buscando GPS...");

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log("Permiso denegado. Usando Fallback.");
        await loadMockData(); 
        return;
      }


      console.log("Buscando satélites activamente...");
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
      } catch (locationError) {
        console.warn("Fallo con Highest, intentando Lowest...", locationError);
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
      }

      const { latitude, longitude } = location.coords;
      console.log(`GPS Encontrado: ${latitude}, ${longitude}`);
      setLocationStatus("Sintonizando zona...");

      const res = await api.post('/api/radio/nearest', {
        latitude: latitude,
        longitude: longitude
      });

      setStation(res.data);
      setLocationStatus("Ubicación sintonizada");

    } catch (error) {
      console.error("Fallo en GPS/API:", error);
      await loadMockData(); 
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = async () => {
    try {
      setLocationStatus("Modo sin GPS");
      console.log("Cargando Radio por defecto...");
      const res = await api.get('/api/radio/mock');
      
      if (!res.data || !res.data.streamUrl || res.data.streamUrl.includes("http://...")) {
        Alert.alert("Error Crítico", "URL de radio inválida recibida del servidor.");
        return;
      }

      setStation(res.data);
    } catch (error) {
      console.error("Error cargando Mock:", error);
      Alert.alert("Error de Conexión", "No se puede conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupPlayer = async () => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (station && station.streamUrl) {
        try {
          console.log("🎵 Intentando reproducir:", station.streamUrl);
          
          const { sound } = await Audio.Sound.createAsync(
            { uri: station.streamUrl },
            { shouldPlay: true }
          );
          
          soundRef.current = sound;
          setIsPlaying(true);

          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            } else if (status.error) {
              console.error(`Player Error: ${status.error}`);
            }
          });

        } catch (error) {
          console.error('Error cargando el stream de audio:', error);
          Alert.alert("Error de Reproducción", "No se pudo conectar con la emisora.");
        }
      }
    };

    setupPlayer();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [station]);

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
      console.error('Error toggling playback:', error);
    }
  };

  const handleLogout = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    await SecureStore.deleteItemAsync('jwt_token');
    navigation.replace('Login');
  };

  // Renderizado UI
  if (loading) return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#646cff" />
      <Text style={{color:'white', marginTop:10}}>{locationStatus}</Text>
    </View>
  );

  if (!station) return (
    <View style={styles.container}>
      <Text style={styles.text}>No hay señal de radio.</Text>
      <TouchableOpacity onPress={initRadio}>
        <Text style={{color:'#646cff', marginTop:20, fontSize:18}}>🔄 Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {}
      <Image source={{ uri: station.logoUrl || 'https://via.placeholder.com/200' }} style={styles.logo} />
      
      {}
      <Text style={styles.stationName}>{station.name}</Text>
      <Text style={styles.genre}>{station.genre}</Text>
      
      {}
      <Text style={styles.locationTag}>{locationStatus}</Text>

      {}
      <TouchableOpacity 
        style={styles.playButton} 
        onPress={togglePlayback}
      >
        <Text style={styles.playIcon}>{isPlaying ? "⏸️" : "▶️"}</Text>
      </TouchableOpacity>

      {}
      <Text style={styles.debugText}>ID: {station.id ? station.id.substring(0,8) : '???'}...</Text>

      {}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={{color: 'red'}}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 200, height: 200, borderRadius: 20, marginBottom: 30, backgroundColor: '#222' },
  stationName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  genre: { color: '#888', fontSize: 18, marginBottom: 5 },
  locationTag: { color: '#646cff', fontSize: 14, marginBottom: 30, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  playButton: { backgroundColor: '#222', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  playIcon: { fontSize: 30, color: 'white' },
  logoutBtn: { marginTop: 50 },
  text: { color: 'white' },
  debugText: { position: 'absolute', bottom: 20, right: 20, color: '#333', fontSize: 10 }
});