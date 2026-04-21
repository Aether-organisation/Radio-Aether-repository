import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Animated, Easing, Keyboard,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAudio } from '../contexts/AudioContext';
import api from '../api/axios';

interface Station {
  id: string;
  name: string;
  logoUrl?: string;
  streamUrl?: string;
  genre?: string;
  country?: string;
}

interface MoodPlaylist {
  title: string;
  description: string;
  stations: Station[];
}


const ThinkingDots: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.thinkingRow}>
      <Text style={styles.thinkingLabel}>Pensando</Text>
      <View style={styles.dotsContainer}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: dot,
                transform: [{
                  translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
                }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};


interface StationCardProps {
  station: Station;
  index: number;
  enterAnim: Animated.Value;
}

const StationCard: React.FC<StationCardProps> = ({ station, index, enterAnim }) => {
  const { playStation, currentStation } = useAudio();
  const [imgErr, setImgErr] = useState(false);
  const isActive = currentStation?.id === station.id;

  const opacity    = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  const handlePlay = () => {
    playStation({
      id: station.id,
      name: station.name,
      logoUrl: station.logoUrl ?? '',
      streamUrl: station.streamUrl ?? '',
      genre: station.genre ?? '',
    });
  };

  return (
    <Animated.View style={[styles.card, isActive && styles.cardActive, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.cardInner} onPress={handlePlay} activeOpacity={0.75}>
        {/* Logo */}
        {station.logoUrl && !imgErr ? (
          <Image
            source={{ uri: station.logoUrl }}
            style={styles.cardLogo}
            onError={() => setImgErr(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardLogo, styles.cardLogoFallback]}>
            <Text style={styles.cardLogoText}>{station.name?.[0]?.toUpperCase() ?? '♫'}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, isActive && styles.cardNameActive]} numberOfLines={1}>
            {station.name}
          </Text>
          {!!station.genre && (
            <Text style={styles.cardGenre} numberOfLines={1}>{station.genre.split(',')[0]}</Text>
          )}
        </View>

        {/* Play indicator / button */}
        <View style={styles.cardPlay}>
          {isActive ? (
            <Ionicons name="musical-notes" size={18} color={ACCENT} />
          ) : (
            <Ionicons name="play-circle-outline" size={24} color={SUBTEXT} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


export const AiScreen: React.FC = () => {
  const [moodText, setMoodText]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [contextualLoading, setCtxLoading] = useState(false);
  const [playlist, setPlaylist]           = useState<MoodPlaylist | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const masterFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-14)).current;
  const cardAnims   = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;
  const resultFade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(masterFade,  { toValue: 1, duration: 480, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const staggerCards = useCallback((count: number) => {
    cardAnims.forEach(a => a.setValue(0));
    resultFade.setValue(0);
    Animated.parallel([
      Animated.timing(resultFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.stagger(
        60,
        cardAnims.slice(0, count).map(a =>
          Animated.spring(a, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
        )
      ),
    ]).start();
  }, []);

  const handleMoodSubmit = async () => {
    const text = moodText.trim();
    if (!text) return;
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setPlaylist(null);

    try {
      const res = await api.post<MoodPlaylist>('/api/ai/mood', { text });
      setPlaylist(res.data);
      staggerCards(res.data.stations?.length ?? 0);
    } catch (e: any) {
      setError('No se pudo generar la playlist. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleContextual = async () => {
    setCtxLoading(true);
    setError(null);
    setPlaylist(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso de ubicación requerido',
        'Activa la ubicación para que la IA pueda sintonizar música según tu momento actual.',
      );
      setCtxLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      const now = new Date();
      const localTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const res = await api.post<MoodPlaylist>('/api/ai/contextual', { latitude, longitude, localTime });
      setPlaylist(res.data);
      staggerCards(res.data.stations?.length ?? 0);
    } catch (e: any) {
      setError('No se pudo obtener la playlist contextual. Inténtalo de nuevo.');
    } finally {
      setCtxLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.container, { opacity: masterFade }]}>

        {/* ── Header ── */}
        <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
          <Text style={styles.appName}>AETHER</Text>
          <Text style={styles.title}>Sintonizador IA</Text>
          <Text style={styles.subtitle}>Cuéntanos cómo te sientes o qué estás haciendo.</Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Mood Tuner section ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎭</Text>
              <View>
                <Text style={styles.sectionTitle}>Mood Tuner</Text>
                <Text style={styles.sectionDesc}>Describe tu estado de ánimo o actividad</Text>
              </View>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder='Ej. "Estudiando concentrado" o "Noche de lluvia"'
                placeholderTextColor={SUBTEXT}
                value={moodText}
                onChangeText={setMoodText}
                multiline
                returnKeyType="done"
                onSubmitEditing={handleMoodSubmit}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!moodText.trim() || loading) && styles.submitBtnDisabled]}
              onPress={handleMoodSubmit}
              disabled={!moodText.trim() || loading}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={styles.submitBtnText}>Generar playlist</Text>
            </TouchableOpacity>
          </View>

          {/* ── Contextual section ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌍</Text>
              <View>
                <Text style={styles.sectionTitle}>Para este momento</Text>
                <Text style={styles.sectionDesc}>Basado en tu ubicación, hora y clima actuales</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.contextBtn, contextualLoading && styles.submitBtnDisabled]}
              onPress={() => {
                console.log('Botón contextual pulsado');
                handleContextual();
              }}
              disabled={contextualLoading || loading}
              activeOpacity={0.6}
            >
              <Ionicons name="location" size={18} color={ACCENT} />
              <Text style={styles.contextBtnText}>Sintonizar ahora</Text>
              {contextualLoading && (
                <ThinkingDots />
              )}
            </TouchableOpacity>
          </View>

          {/* ── Thinking animation (mood) ── */}
          {loading && (
            <View style={styles.thinkingContainer}>
              <ThinkingDots />
            </View>
          )}

          {/* ── Error ── */}
          {!!error && !loading && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color="#f87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Playlist result ── */}
          {playlist && !loading && (
            <Animated.View style={[styles.resultContainer, { opacity: resultFade }]}>
              {/* Playlist header */}
              <View style={styles.playlistHeader}>
                <Text style={styles.playlistTitle}>{playlist.title}</Text>
                <Text style={styles.playlistDesc}>{playlist.description}</Text>
              </View>

              {/* Station cards */}
              <View style={styles.stationsList}>
                {playlist.stations.map((station, index) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    index={index}
                    enterAnim={cardAnims[index] ?? new Animated.Value(1)}
                  />
                ))}
              </View>

              {playlist.stations.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="radio-outline" size={40} color={BORDER} />
                  <Text style={styles.emptyText}>No se encontraron emisoras para este mood.</Text>
                </View>
              )}
            </Animated.View>
          )}

        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};


const ACCENT  = '#646cff';
const BG      = '#0E0E1A';
const SURFACE = '#16162A';
const BORDER  = '#2D2D4A';
const TEXT    = '#FFFFFF';
const SUBTEXT = '#9399B2';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: SUBTEXT,
    lineHeight: 20,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 20,
  },

  section: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionIcon: {
    fontSize: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 13,
    color: SUBTEXT,
    lineHeight: 18,
  },

  inputRow: {
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 72,
  },
  input: {
    color: TEXT,
    fontSize: 15,
    lineHeight: 22,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 13,
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  contextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(100,108,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(100,108,255,0.30)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  contextBtnText: {
    flex: 1,
    color: TEXT,
    fontWeight: '600',
    fontSize: 15,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(100,108,255,0.2)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comingSoonText: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '700',
  },

  thinkingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thinkingLabel: {
    fontSize: 14,
    color: SUBTEXT,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    flex: 1,
    color: '#f87171',
    fontSize: 14,
    lineHeight: 20,
  },

  resultContainer: {
    gap: 16,
  },
  playlistHeader: {
    gap: 6,
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
  },
  playlistDesc: {
    fontSize: 13,
    color: SUBTEXT,
    lineHeight: 20,
  },
  stationsList: {
    gap: 8,
  },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(100,108,255,0.08)',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  cardLogo: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: BORDER,
  },
  cardLogoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100,108,255,0.18)',
  },
  cardLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
  cardNameActive: {
    color: ACCENT,
  },
  cardGenre: {
    fontSize: 12,
    color: SUBTEXT,
  },
  cardPlay: {
    width: 32,
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: SUBTEXT,
    textAlign: 'center',
  },
});
