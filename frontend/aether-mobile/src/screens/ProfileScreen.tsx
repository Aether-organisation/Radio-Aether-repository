import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { useAudio } from '../contexts/AudioContext';

export const ProfileScreen = ({ navigation }: any) => {
  const { clearFavorites } = useFavorites();
  const { resetPlaylists } = usePlaylists();
  const { unload } = useAudio();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailVisible, setEmailVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      setProfile(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        await api.put('/api/user/profile-picture', { fotoPerfil: base64Img });
        setProfile({ ...profile, fotoPerfil: base64Img });
        Alert.alert('Éxito', 'Foto de perfil actualizada');
      } catch (e) {
        Alert.alert('Error', 'No se pudo actualizar la foto');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await unload();
          clearFavorites();
          resetPlaylists();
          await SecureStore.deleteItemAsync('jwt_token');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Rellena todos los campos de contraseña');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.put('/api/user/change-password', {
        currentPassword,
        newPassword
      });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#646cff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Perfil</Text>
      
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          {profile?.fotoPerfil ? (
            <Image source={{ uri: profile.fotoPerfil }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Ionicons name="camera" size={40} color="#888" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{profile?.nombre || 'Usuario'}</Text>
        <Text style={styles.memberSince}>
          Miembro desde {profile?.fechaRegistro ? new Date(profile.fechaRegistro).toLocaleDateString() : 'hoy'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Correo Electrónico</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.infoValue}>
              {emailVisible ? profile?.email : '••••••••••••••••'}
            </Text>
            <TouchableOpacity onPress={() => setEmailVisible(!emailVisible)}>
              <Ionicons name={emailVisible ? "eye-off" : "eye"} size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña actual"
            placeholderTextColor="#888"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24, paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, marginTop: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#646cff' },
  placeholder: { backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#646cff', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#121212' },
  username: { fontSize: 24, fontWeight: '600', color: '#fff', marginTop: 16 },
  memberSince: { fontSize: 14, color: '#888', marginTop: 4 },
  section: { marginBottom: 32, backgroundColor: '#1E1E1E', borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  infoBox: { borderBottomWidth: 1, borderBottomColor: '#2C2C2C', paddingBottom: 16, paddingTop: 8 },
  infoLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  emailContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoValue: { fontSize: 16, color: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#646cff', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 32, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,77,77,0.3)' },
  logoutText: { color: '#ff4d4d', fontSize: 16, fontWeight: '600' },
});
