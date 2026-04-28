import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Easing, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import { Colors, Radius } from '../theme/theme';

export const RegisterScreen = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    confirmarEmail?: string;
    password?: string;
    confirmarPassword?: string;
  }>({});

  const [nombreFocused, setNombreFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [confirmarEmailFocused, setConfirmarEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmarPasswordFocused, setConfirmarPasswordFocused] = useState(false);

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

  const validateFields = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      isValid = false;
    } else if (nombre.length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (email !== confirmarEmail) {
      newErrors.confirmarEmail = 'Los emails no coinciden';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      isValid = false;
    }

    if (password !== confirmarPassword) {
      newErrors.confirmarPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { nombre, email, password });
      await SecureStore.setItemAsync('jwt_token', response.data.token);
      await SecureStore.setItemAsync('user_name', nombre);
      if (!response.data.surveyCompleted) {
        navigation.replace('Survey');
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error: any) {
      const errorMessage = (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        'Error al registrar. Inténtalo de nuevo.'
      ).toLowerCase();

      if (errorMessage.includes('email')) {
        setErrors(prev => ({ ...prev, email: 'Este email ya está registrado. Usa otro diferente.' }));
      } else if (errorMessage.includes('nombre') || errorMessage.includes('usuario')) {
        setErrors(prev => ({ ...prev, nombre: 'Este nombre de usuario ya está en uso. Prueba otro.' }));
      } else {
        setErrors(prev => ({ ...prev, nombre: 'Error al crear la cuenta. Inténtalo de nuevo.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}>
          <View style={styles.brand}>
            <Text style={styles.brandLabel}>AETHER</Text>
            <Text style={styles.brandTitle}>Únete al éter.</Text>
            <Text style={styles.brandSub}>Tu frecuencia, tus reglas.</Text>
          </View>

          <View style={[styles.inputWrap, nombreFocused && styles.inputWrapFocused, errors.nombre && styles.inputWrapError]}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor={Colors.textTertiary}
              value={nombre}
              onChangeText={(text) => { setNombre(text); if (errors.nombre) setErrors(prev => ({ ...prev, nombre: undefined })); }}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setNombreFocused(true)}
              onBlur={() => setNombreFocused(false)}
            />
          </View>
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused, errors.email && styles.inputWrapError]}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={(text) => { setEmail(text); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={[styles.inputWrap, confirmarEmailFocused && styles.inputWrapFocused, errors.confirmarEmail && styles.inputWrapError]}>
            <TextInput
              style={styles.input}
              placeholder="Repetir email"
              placeholderTextColor={Colors.textTertiary}
              value={confirmarEmail}
              onChangeText={setConfirmarEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onFocus={() => setConfirmarEmailFocused(true)}
              onBlur={() => setConfirmarEmailFocused(false)}
            />
          </View>
          {errors.confirmarEmail && <Text style={styles.errorText}>{errors.confirmarEmail}</Text>}

          <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused, errors.password && styles.inputWrapError]}>
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
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={[styles.inputWrap, confirmarPasswordFocused && styles.inputWrapFocused, errors.confirmarPassword && styles.inputWrapError]}>
            <TextInput
              style={styles.input}
              placeholder="Repetir contraseña"
              placeholderTextColor={Colors.textTertiary}
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry
              onFocus={() => setConfirmarPasswordFocused(true)}
              onBlur={() => setConfirmarPasswordFocused(false)}
            />
          </View>
          {errors.confirmarPassword && <Text style={styles.errorText}>{errors.confirmarPassword}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.void} />
            ) : (
              <Text style={styles.btnText}>CREAR CUENTA</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.linkAccent}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: Colors.aiPurple,
    alignSelf: 'center',
    top: '5%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 60,
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
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapError: {
    borderColor: Colors.textError,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  errorText: {
    color: Colors.textError,
    fontSize: 12,
    marginTop: -8,
    marginLeft: 4,
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
