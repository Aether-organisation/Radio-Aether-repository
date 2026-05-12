
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, StatusBar, Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

const GENRES = [
  { label: 'Rock',       emoji: '🎸' },
  { label: 'Pop',        emoji: '🎤' },
  { label: 'Jazz',       emoji: '🎷' },
  { label: 'Electronic', emoji: '🎧' },
  { label: 'Clásica',    emoji: '🎻' },
  { label: 'Hip-Hop',    emoji: '🎵' },
  { label: 'Country',    emoji: '🤠' },
  { label: 'Metal',      emoji: '🤘' },
  { label: 'Reggae',     emoji: '🌿' },
  { label: 'Punk',       emoji: '⚡' },
  { label: 'Indie',      emoji: '🌙' },
  { label: 'Folk',       emoji: '🪕' },
  { label: 'R&B',        emoji: '💜' },
  { label: 'Reggaeton', emoji: '🔥' },
  { label: 'Trap',      emoji: '🎤' },
  { label: 'Urbano',    emoji: '🏙️' },
  { label: 'Dembow',    emoji: '🥁' },
  { label: 'Afrobeats', emoji: '🌍' },
  { label: 'Blues',      emoji: '🎺' },
  { label: 'Techno',     emoji: '🔊' },
];

const GENDER_OPTIONS = [
  { label: 'Hombre',           emoji: '🧔', value: 'HOMBRE'     },
  { label: 'Mujer',            emoji: '👩', value: 'MUJER'      },
  { label: 'No binario / Otro', emoji: '✨', value: 'NO_BINARIO' },
];

export const SurveyScreen = () => {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation<any>();

  // ── Master transition values ─────────────────────────────────────────────
  const contentFade  = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  // ── Welcome ──────────────────────────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0.6)).current;

  // ── Transition step pulsing dots ─────────────────────────────────────────
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  // ── Completion ───────────────────────────────────────────────────────────
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  // ── Per-card bounce scales ────────────────────────────────────────────────
  const genderScales = useRef(GENDER_OPTIONS.map(() => new Animated.Value(1))).current;
  const genreScales  = useRef(GENRES.map(() => new Animated.Value(1))).current;

  // ── Load username and kick off welcome animation ──────────────────────────
  useEffect(() => {
    SecureStore.getItemAsync('user_name').then(name => {
      if (name) setUserName(name);
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // ── Slide transition between steps ───────────────────────────────────────
  const transitionToStep = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: -25,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      contentSlide.setValue(35);
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // ── Step-specific side-effects ────────────────────────────────────────────
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => transitionToStep(1), 3200);
      return () => clearTimeout(t);
    }

    if (step === 2) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.delay(180),
          Animated.parallel([
            Animated.timing(dot1, { toValue: 0.3, duration: 250, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0.3, duration: 250, useNativeDriver: true }),
            Animated.timing(dot3, { toValue: 0.3, duration: 250, useNativeDriver: true }),
          ]),
        ])
      );
      pulseRef.current.start();
      const t = setTimeout(() => transitionToStep(3), 2800);
      return () => {
        clearTimeout(t);
        pulseRef.current?.stop();
      };
    }

    if (step === 4) {
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.spring(checkScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
          Animated.timing(checkOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
      const t = setTimeout(() => navigation.replace('MainTabs'), 2500);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Gender selection ──────────────────────────────────────────────────────
  const handleGenderSelect = (value: string, index: number) => {
    setSelectedGender(value);
    Animated.sequence([
      Animated.spring(genderScales[index], { toValue: 0.93, tension: 150, friction: 5, useNativeDriver: true }),
      Animated.spring(genderScales[index], { toValue: 1.04, tension: 100, friction: 4, useNativeDriver: true }),
      Animated.spring(genderScales[index], { toValue: 1,    tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    setTimeout(() => transitionToStep(2), 650);
  };

  // ── Genre toggle ─────────────────────────────────────────────────────────
  const handleGenreToggle = (label: string, index: number) => {
    Animated.sequence([
      Animated.spring(genreScales[index], { toValue: 0.88, tension: 150, friction: 5, useNativeDriver: true }),
      Animated.spring(genreScales[index], { toValue: 1,    tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    setSelectedGenres(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  // ── Submit / skip ─────────────────────────────────────────────────────────
  const submitSurvey = async (genres: string[]) => {
    try {
      await api.put('/api/user/survey-completed', {
        favoriteGenres: genres,
        gender: selectedGender,
      });
    } catch (e) {
      console.error('Survey error:', e);
    }
  };

  const handleFinish = async () => {
    if (selectedGenres.length === 0) return;
    setIsSubmitting(true);
    await submitSurvey(selectedGenres);
    setIsSubmitting(false);
    transitionToStep(4);
  };

  const handleSkip = async () => {
    await submitSurvey([]);
    transitionToStep(4);
  };

  // ── Progress pill dots ────────────────────────────────────────────────────
  const renderProgress = (active: number) => (
    <View style={styles.progressRow}>
      {[0, 1].map(i => (
        <View key={i} style={[styles.progressDot, i < active && styles.progressDotActive]} />
      ))}
    </View>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 0 – Welcome
  // ────────────────────────────────────────────────────────────────────────
  const renderWelcome = () => (
    <View style={styles.centerContent}>
      <Animated.View style={{ transform: [{ scale: logoScale }] }}>
        <Text style={styles.logoEmoji}>🌌</Text>
      </Animated.View>
      <Text style={styles.appTitle}>AETHER</Text>
      <Text style={styles.welcomeHello}>
        Hola{userName ? `, ${userName}` : ''} 👋
      </Text>
      <Text style={styles.welcomeSub}>
        Vamos a preparar la mejor{'\n'}experiencia musical para ti
      </Text>
    </View>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 1 – Gender
  // ────────────────────────────────────────────────────────────────────────
  const renderGender = () => (
    <View style={styles.stepContent}>
      {renderProgress(1)}
      <Text style={styles.stepTitle}>¿Cómo te identificas?</Text>
      <Text style={styles.stepSub}>Personaliza tu experiencia desde el principio</Text>
      <View style={styles.genderList}>
        {GENDER_OPTIONS.map((opt, i) => (
          <Animated.View key={opt.value} style={{ transform: [{ scale: genderScales[i] }] }}>
            <TouchableOpacity
              style={[styles.genderCard, selectedGender === opt.value && styles.genderCardActive]}
              onPress={() => handleGenderSelect(opt.value, i)}
              activeOpacity={0.85}
            >
              <Text style={styles.genderEmoji}>{opt.emoji}</Text>
              <Text style={[styles.genderLabel, selectedGender === opt.value && styles.genderLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 2 – Transition message
  // ────────────────────────────────────────────────────────────────────────
  const renderTransition = () => (
    <View style={styles.centerContent}>
      <Text style={styles.transitionTitle}>Preparando tu experiencia</Text>
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.pulseDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.pulseDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.pulseDot, { opacity: dot3 }]} />
      </View>
      <Text style={styles.transitionSub}>
        Vamos a descubrir qué música te mueve...
      </Text>
    </View>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 3 – Genre selection
  // ────────────────────────────────────────────────────────────────────────
  const renderGenres = () => (
    <View style={styles.stepContent}>
      {renderProgress(2)}
      <Text style={styles.stepTitle}>¿Qué música te mueve?</Text>
      <Text style={styles.stepSub}>Elige tus géneros favoritos</Text>

      <ScrollView
        style={styles.genreScroll}
        contentContainerStyle={styles.genreGrid}
        showsVerticalScrollIndicator={false}
      >
        {GENRES.map((genre, i) => {
          const active = selectedGenres.includes(genre.label);
          return (
            <Animated.View key={genre.label} style={{ transform: [{ scale: genreScales[i] }] }}>
              <TouchableOpacity
                style={[styles.genreChip, active && styles.genreChipActive]}
                onPress={() => handleGenreToggle(genre.label, i)}
                activeOpacity={0.75}
              >
                <Text style={styles.genreEmoji}>{genre.emoji}</Text>
                <Text style={[styles.genreLabel, active && styles.genreLabelActive]}>
                  {genre.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {selectedGenres.length > 0 && (
        <Text style={styles.selectedCount}>
          {selectedGenres.length}{' '}
          {selectedGenres.length === 1 ? 'género seleccionado' : 'géneros seleccionados'}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, selectedGenres.length === 0 && styles.primaryBtnDisabled]}
        onPress={handleFinish}
        disabled={isSubmitting || selectedGenres.length === 0}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>
          {isSubmitting ? 'Guardando...' : 'Listo  →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipBtnText}>Saltar por ahora</Text>
      </TouchableOpacity>
    </View>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 4 – Completion
  // ────────────────────────────────────────────────────────────────────────
  const renderCompletion = () => (
    <View style={styles.centerContent}>
      <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkOpacity }}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      </Animated.View>
      <Text style={styles.doneTitle}>
        ¡Todo listo{userName ? `, ${userName}` : ''}!
      </Text>
      <Text style={styles.doneSub}>
        Tu experiencia en Aether está lista.
      </Text>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderGender();
      case 2: return renderTransition();
      case 3: return renderGenres();
      case 4: return renderCompletion();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E1A" />
      <Animated.View
        style={[
          styles.content,
          { opacity: contentFade, transform: [{ translateY: contentSlide }] },
        ]}
      >
        {renderStep()}
      </Animated.View>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const BG          = '#0E0E1A';
const SURFACE     = '#16162A';
const BORDER      = '#2D2D4A';
const TEXT        = '#FFFFFF';
const SUBTEXT     = '#9399B2';
const CYAN        = '#00D1FF';
const CYAN_GLOW   = 'rgba(0, 209, 255, 0.15)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
  },

  // ── Shared layouts ──────────────────────────────────────────────────────
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  stepContent: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
  },

  // ── Progress ────────────────────────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER,
  },
  progressDotActive: {
    width: 28,
    borderRadius: 4,
    backgroundColor: CYAN,
  },

  // ── Welcome ─────────────────────────────────────────────────────────────
  logoEmoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 36,
  },
  welcomeHello: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSub: {
    fontSize: 16,
    color: SUBTEXT,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Step headings ────────────────────────────────────────────────────────
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 14,
    color: SUBTEXT,
    marginBottom: 32,
    lineHeight: 20,
  },

  // ── Gender cards ─────────────────────────────────────────────────────────
  genderList: {
    gap: 14,
  },
  genderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  genderCardActive: {
    borderColor: CYAN,
    backgroundColor: CYAN_GLOW,
  },
  genderEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: SUBTEXT,
  },
  genderLabelActive: {
    color: TEXT,
  },

  // ── Transition ───────────────────────────────────────────────────────────
  transitionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CYAN,
  },
  transitionSub: {
    fontSize: 15,
    color: SUBTEXT,
    textAlign: 'center',
  },

  // ── Genre grid ────────────────────────────────────────────────────────────
  genreScroll: {
    flex: 1,
    marginBottom: 10,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 12,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  genreChipActive: {
    backgroundColor: CYAN_GLOW,
    borderColor: CYAN,
  },
  genreEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  genreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SUBTEXT,
  },
  genreLabelActive: {
    color: TEXT,
  },
  selectedCount: {
    textAlign: 'center',
    color: CYAN,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: CYAN,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnDisabled: {
    opacity: 0.35,
  },
  primaryBtnText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    color: SUBTEXT,
    fontSize: 14,
  },

  // ── Completion ───────────────────────────────────────────────────────────
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CYAN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  checkMark: {
    fontSize: 46,
    color: TEXT,
    fontWeight: '700',
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  doneSub: {
    fontSize: 16,
    color: SUBTEXT,
    textAlign: 'center',
  },
});
