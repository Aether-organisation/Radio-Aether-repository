import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';

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

  const { colors, isDark, toggleTheme } = useTheme();
  const dynamicStyles = getStyles(colors);

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
      <View style={dynamicStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.cyan} />
      </View>
    );
  }

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.content}>
      <Text style={dynamicStyles.title}>Mi Perfil</Text>
      
      <View style={dynamicStyles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          {profile?.fotoPerfil ? (
            <Image source={{ uri: profile.fotoPerfil }} style={dynamicStyles.avatar} />
          ) : (
            <View style={[dynamicStyles.avatar, dynamicStyles.placeholder]}>
              <Ionicons name="camera" size={40} color={colors.textSecondary} />
            </View>
          )}
          <View style={dynamicStyles.editBadge}>
            <Ionicons name="pencil" size={12} color={colors.void} />
          </View>
        </TouchableOpacity>
        <Text style={dynamicStyles.username}>{profile?.nombre || 'Usuario'}</Text>
        <Text style={dynamicStyles.memberSince}>
          Miembro desde {profile?.fechaRegistro ? new Date(profile.fechaRegistro).toLocaleDateString() : 'hoy'}
        </Text>
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Apariencia</Text>
        <View style={[dynamicStyles.infoBox, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0 }]}>
          <Text style={[dynamicStyles.infoValue, { fontSize: 16 }]}>Tema oscuro</Text>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#ccc', true: colors.cyan }}
            thumbColor={'#fff'}
          />
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Información Personal</Text>
        <View style={dynamicStyles.infoBox}>
          <Text style={dynamicStyles.infoLabel}>Correo Electrónico</Text>
          <View style={dynamicStyles.emailContainer}>
            <Text style={dynamicStyles.infoValue}>
              {emailVisible ? profile?.email : '••••••••••••••••'}
            </Text>
            <TouchableOpacity onPress={() => setEmailVisible(!emailVisible)}>
              <Ionicons name={emailVisible ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Seguridad</Text>
        <View style={dynamicStyles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={dynamicStyles.inputIcon} />
          <TextInput
            style={dynamicStyles.input}
            placeholder="Contraseña actual"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>
        <View style={dynamicStyles.inputContainer}>
          <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={dynamicStyles.inputIcon} />
          <TextInput
            style={dynamicStyles.input}
            placeholder="Nueva contraseña"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <TouchableOpacity 
          style={dynamicStyles.button} 
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <ActivityIndicator color={colors.void} />
          ) : (
            <Text style={dynamicStyles.buttonText}>Cambiar Contraseña</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={dynamicStyles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.textError} />
        <Text style={dynamicStyles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.void },
  content: { padding: 24, paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.void },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 24, marginTop: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: colors.cyan },
  placeholder: { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: colors.cyan, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.void },
  username: { fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginTop: 16 },
  memberSince: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  section: { marginBottom: 32, backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
  infoBox: { borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, paddingBottom: 16, paddingTop: 8 },
  infoLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  emailContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoValue: { fontSize: 16, color: colors.textPrimary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceGlass, borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: colors.textPrimary, fontSize: 16 },
  button: { backgroundColor: colors.cyan, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.void, fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 32, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.textError + '4D' }, // Appending 4D for 30% opacity
  logoutText: { color: colors.textError, fontSize: 16, fontWeight: '600' },
});
