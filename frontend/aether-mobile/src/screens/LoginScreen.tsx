import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Animated, Easing, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { Colors, Radius } from '../theme/theme';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { loadFavorites } = useFavorites();
  const { loadPlaylists } = usePlaylists();

  const glowAnim     = useRef(new Animated.Value(0)).current;
  const contentFade  = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(contentFade,  { toValue: 1, duration: 600, delay: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync('jwt_token', response.data.token);
      loadFavorites().catch(() => {});
      loadPlaylists().catch(() => {});
      if (!response.data.surveyCompleted) {
        navigation.replace('Survey');
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas o fallo de conexión');
    } finally {
      setLoading(false);
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  return (
    <Container style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      <Animated.View style={[styles.content, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}>
        <View style={styles.brand}>
          <Text style={styles.brandLabel}>AETHER</Text>
          <Text style={styles.brandTitle}>Bienvenido de nuevo.</Text>
          <Text style={styles.brandSub}>Tu frecuencia te espera.</Text>
        </View>

        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            blurOnSubmit={false}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.void} />
          ) : (
            <Text style={styles.btnText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register' as never)}>
          <Text style={styles.linkText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.linkAccent}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Container>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.void,
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: Colors.aiPurple,
    alignSelf: 'center',
    top: '10%',
  },
  content: {
    paddingHorizontal: 28,
    gap: 14,
  },
  brand: {
    marginBottom: 12,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.cyan,
    letterSpacing: 5,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inputWrap: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  inputWrapFocused: {
    borderColor: Colors.cyan,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  btn: {
    backgroundColor: Colors.cyan,
    borderRadius: Radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.void,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  link: {
    alignItems: 'center',
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkAccent: {
    color: Colors.cyan,
    fontWeight: '600',
  },
});
