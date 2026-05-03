import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Easing, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { Radius } from '../theme/theme';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.void,
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.aiPurple,
    alignSelf: 'center',
    top: '10%',
  },
  content: {
    paddingHorizontal: 28,
    gap: 16,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  brand: {
    gap: 6,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.cyan,
    letterSpacing: 5,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emailHighlight: {
    color: colors.cyan,
    fontWeight: '600',
  },
  inputWrap: {
    backgroundColor: colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 16,
    height: 64,
    justifyContent: 'center',
    marginTop: 4,
  },
  inputWrapFocused: {
    borderColor: colors.cyan,
  },
  codeInput: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 12,
  },
  btn: {
    backgroundColor: colors.cyan,
    borderRadius: Radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    color: colors.void,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendBtnDisabled: {
    opacity: 0.4,
  },
  resendText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '600',
  },
  link: {
    alignItems: 'center',
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const RESEND_COOLDOWN = 60; // seconds

export const VerifyEmailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { nombre, email, password } = route.params;

  const [code, setCode]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [resending, setResending]   = useState(false);
  const [countdown, setCountdown]   = useState(RESEND_COOLDOWN);
  const [codeFocused, setCodeFocused] = useState(false);

  const { loadFavorites } = useFavorites();
  const { loadPlaylists } = usePlaylists();

  const glowAnim     = useRef(new Animated.Value(0)).current;
  const contentFade  = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  // Entry animation
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

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      Alert.alert('Código inválido', 'Introduce el código de 6 dígitos que te enviamos.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        nombre,
        email,
        password,
        verificationCode: trimmed,
      });
      await SecureStore.setItemAsync('jwt_token', res.data.token);
      await SecureStore.setItemAsync('user_name', nombre);
      loadFavorites().catch(() => {});
      loadPlaylists().catch(() => {});
      if (!res.data.surveyCompleted) {
        navigation.replace('Survey');
      } else {
        navigation.replace('MainTabs');
      }
    } catch (err: any) {
      const msg: string = (
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        'Código incorrecto o caducado.'
      );
      Alert.alert('Error', msg.includes('erif') ? 'Código incorrecto o caducado. Prueba de nuevo.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/initiate-register', { nombre, email, password });
      setCountdown(RESEND_COOLDOWN);
      setCode('');
      Alert.alert('Código reenviado', `Hemos enviado un nuevo código a ${email}.`);
    } catch {
      Alert.alert('Error', 'No se pudo reenviar el código. Inténtalo más tarde.');
    } finally {
      setResending(false);
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      <Animated.View style={[styles.content, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={44} color={colors.cyan} />
        </View>

        <View style={styles.brand}>
          <Text style={styles.brandLabel}>AETHER</Text>
          <Text style={styles.brandTitle}>Revisa tu correo.</Text>
          <Text style={styles.brandSub}>
            Te hemos enviado un código de 6 dígitos a{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        {/* Code input */}
        <View style={[styles.inputWrap, codeFocused && styles.inputWrapFocused]}>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor={colors.textTertiary}
            value={code}
            onChangeText={t => setCode(t.replace(/\D/g, '').substring(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            onFocus={() => setCodeFocused(true)}
            onBlur={() => setCodeFocused(false)}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.btn, (loading || code.length !== 6) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.void} />
          ) : (
            <Text style={styles.btnText}>VERIFICAR</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          style={[styles.resendBtn, (countdown > 0 || resending) && styles.resendBtnDisabled]}
          onPress={handleResend}
          disabled={countdown > 0 || resending}
          activeOpacity={0.8}
        >
          <Text style={styles.resendText}>
            {resending
              ? 'Reenviando…'
              : countdown > 0
                ? `Reenviar código en ${countdown}s`
                : '¿No llegó? Reenviar código'}
          </Text>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>
            Volver al registro
          </Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
};


