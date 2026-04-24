import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Animated, Image, Easing, Alert, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, Modal
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '../types/navigation';
import { useAudio } from '../contexts/AudioContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { RadioStation } from '../types';
import api from '../api/axios';
import { saveHomeStations, getHomeStations } from '../db/database';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineBanner } from '../components/OfflineBanner';
import { StationCard } from '../components/StationCard';
import { Colors, Radius } from '../theme/theme';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;
const SKELETON_COUNT = 4;

interface AiPlaylist {
  title: string;
  description: string;
  stations: RadioStation[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = (name: string) => {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return { headline: name ? `Buenos días, ${name}.` : 'Buenos días.', sub: 'El éter está despertando.' };
  if (h >= 12 && h < 19) return { headline: name ? `Hola, ${name}.` : 'Hola.', sub: 'Elige lo que suena ahora.' };
  return { headline: name ? `Buenas, ${name}.` : 'Buenas.', sub: 'El éter es tuyo esta noche.' };
};

// ─── ThinkingDots ─────────────────────────────────────────────────────────────

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

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard: React.FC<{ pulse: Animated.Value }> = ({ pulse }) => {
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });
  return (
    <Animated.View style={[styles.card, styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
    </Animated.View>
  );
};

// ─── SectionHeader ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: string;
  title: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}> = ({ icon, title, onRefresh, isLoading }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderTitle}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {onRefresh && (
      <TouchableOpacity onPress={onRefresh} disabled={isLoading} style={styles.refreshBtn}>
        <Ionicons
          name="refresh-outline"
          size={18}
          color={isLoading ? Colors.textSecondary : Colors.cyan}
        />
      </TouchableOpacity>
    )}
  </View>
);

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { playStation, currentStation, unload } = useAudio();
  const { isOnline } = useNetworkStatus();

  const [userName, setUserName] = useState('');
  const [featuredStations, setFeaturedStations] = useState<RadioStation[]>([]);
  const [nearestStations, setNearestStations] = useState<RadioStation[]>([]);
  const [recommendedStations, setRecommended] = useState<RadioStation[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [nearestLoading, setNearestLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  const [moodText, setMoodText]         = useState('');
  const [aiLoading, setAiLoading]       = useState(false);
  const [ctxLoading, setCtxLoading]     = useState(false);
  const [aiPlaylist, setAiPlaylist]     = useState<AiPlaylist | null>(null);
  const [aiError, setAiError]           = useState<string | null>(null);

  const { createPlaylist, addStationToPlaylist } = usePlaylists();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalName, setSaveModalName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const handleConfirmSave = async () => {
    if (!saveModalName.trim() || saveLoading || !aiPlaylist) return;
    setSaveLoading(true);
    try {
      const newPlaylist = await createPlaylist(saveModalName.trim());
      for (const st of aiPlaylist.stations) {
        await addStationToPlaylist(newPlaylist.id, st);
      }
      setSaveModalVisible(false);
      Alert.alert('Éxito', 'Lista guardada en tu biblioteca.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la lista.');
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Animations ──────────────────────────────────────────────────────────────
  const masterFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;
  const sec0Slide   = useRef(new Animated.Value(36)).current;
  const sec1Slide   = useRef(new Animated.Value(36)).current;
  const sec2Slide   = useRef(new Animated.Value(36)).current;
  const pulse       = useRef(new Animated.Value(0)).current;

  const featuredAnims = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;
  const nearestAnims  = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;
  const forYouAnims   = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(masterFade, { toValue: 1, duration: 550, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.sequence([Animated.delay(65),  Animated.spring(sec0Slide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(195), Animated.spring(sec1Slide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(325), Animated.spring(sec2Slide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true })]),
    ]).start();
  }, []);

  const staggerCards = useCallback((anims: Animated.Value[]) => {
    Animated.stagger(
      60,
      anims.map(a => Animated.spring(a, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }))
    ).start();
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync('user_name').then(n => { if (n) setUserName(n); });
    fetchFeatured();
    fetchNearest();
    fetchForYou();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/api/radio/featured');
      setFeaturedStations(res.data);
      staggerCards(featuredAnims.slice(0, res.data.length));
    } catch (e: any) {
      console.log('Featured fetch handled error:', e.message || e);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const fetchNearest = async () => {
    setNearestLoading(true);
    try {
      console.log('[GPS-1] Checking location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[GPS-1] Permission status:', status);
      if (status !== 'granted') { setLocationDenied(true); setNearestLoading(false); return; }

      let location: Location.LocationObject | null = null;

      console.log('[GPS-2] Trying getLastKnownPositionAsync...');
      try {
        location = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
        console.log('[GPS-2] Result:', location ? `Lat ${location.coords.latitude}, Lon ${location.coords.longitude}` : 'null (no cached position)');
      } catch (e: any) {
        console.log('[GPS-2] Error:', e.message);
      }

      if (!location) {
        console.log('[GPS-3] Trying getCurrentPositionAsync (Highest)...');
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          console.log('[GPS-3] OK:', location.coords.latitude, location.coords.longitude);
        } catch (e: any) {
          console.log('[GPS-3] Error:', e.message);
        }
      }

      if (!location) {
        console.log('[GPS-4] Trying getCurrentPositionAsync (Balanced)...');
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          console.log('[GPS-4] OK:', location.coords.latitude, location.coords.longitude);
        } catch (gpsErr: any) {
          console.log('[GPS-4] Final error:', gpsErr.message);
          throw new Error(`location: ${gpsErr.message}`);
        }
      }

      const { latitude, longitude } = location!.coords;
      console.log(`[GPS-OK] Final coords → Lat: ${latitude}, Lon: ${longitude}`);

      const res = await api.post('/api/radio/nearest', { latitude, longitude });
      setNearestStations(res.data);
      staggerCards(nearestAnims.slice(0, res.data.length));
      saveHomeStations(res.data, 'nearest').catch(() => { });
    } catch (e: any) {
      console.log('Nearest fetch handled error:', e.message || e);
      if (e.message && e.message.toLowerCase().includes('location')) {
        setLocationDenied(true);
      } else {
        const cached = await getHomeStations('nearest').catch(() => []);
        setNearestStations(cached);
        staggerCards(nearestAnims.slice(0, cached.length));
      }
    } finally {
      setNearestLoading(false);
    }
  };

  const fetchForYou = async () => {
    try {
      const res = await api.get('/api/radio/foryou');
      setRecommended(res.data);
      staggerCards(forYouAnims.slice(0, res.data.length));
      saveHomeStations(res.data, 'foryou').catch(() => { });
    } catch (e: any) {
      console.log('ForYou fetch handled error:', e.message || e);
      const cached = await getHomeStations('foryou').catch(() => []);
      setRecommended(cached);
      staggerCards(forYouAnims.slice(0, cached.length));
    } finally {
      setRecommendedLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, salir', style: 'destructive',
        onPress: async () => {
          await unload();
          await SecureStore.deleteItemAsync('jwt_token');
          await SecureStore.deleteItemAsync('user_name');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleMoodSubmit = async () => {
    const text = moodText.trim();
    if (!text) return;
    Keyboard.dismiss();
    setAiLoading(true);
    setAiError(null);
    setAiPlaylist(null);
    try {
      const res = await api.post<AiPlaylist>('/api/ai/mood', { text });
      setAiPlaylist(res.data);
    } catch {
      setAiError('El éter no respondió. Inténtalo de nuevo.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleContextual = async () => {
    setCtxLoading(true);
    setAiError(null);
    setAiPlaylist(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAiError('Necesitamos tu ubicación para esto.');
        setCtxLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const now = new Date();
      const localTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const res = await api.post<AiPlaylist>('/api/ai/contextual', { latitude, longitude, localTime });
      setAiPlaylist(res.data);
    } catch {
      setAiError('No se pudo sintonizar este momento. Inténtalo de nuevo.');
    } finally {
      setCtxLoading(false);
    }
  };

  const greeting = getGreeting(userName);

  const renderStation = (
    { item, index }: { item: RadioStation; index: number },
    anims: Animated.Value[],
    isFeatured?: boolean
  ) => (
    <StationCard
      station={item}
      isActive={currentStation?.id === item.id}
      onPress={playStation}
      enterAnim={anims[index] ?? new Animated.Value(1)}
      featured={isFeatured}
      layout="grid"
    />
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonRow}>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <SkeletonCard key={i} pulse={pulse} />
      ))}
    </View>
  );

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.void }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OfflineBanner isOnline={isOnline} />
      <Animated.ScrollView
        style={[styles.container, { opacity: masterFade }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={styles.appName}>AETHER</Text>
            <Text style={styles.greeting}>{greeting.headline}</Text>
            <Text style={styles.greetingSub}>{greeting.sub}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── ✦ AI HERO ── */}
        <View style={styles.aiHero}>

          {/* Badge */}
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={11} color={Colors.aiPurple} />
            <Text style={styles.aiBadgeText}>AETHER IA</Text>
          </View>

          {/* Text input */}
          <TextInput
            style={styles.aiInput}
            placeholder="¿Cómo estás ahora mismo?"
            placeholderTextColor={Colors.textSecondary}
            value={moodText}
            onChangeText={setMoodText}
            multiline
            returnKeyType="done"
            onSubmitEditing={handleMoodSubmit}
          />

          {/* Buttons row */}
          <View style={styles.aiButtonsRow}>
            <TouchableOpacity
              style={[styles.aiSubmitBtn, (!moodText.trim() || aiLoading) && styles.aiBtnDisabled]}
              onPress={handleMoodSubmit}
              disabled={!moodText.trim() || aiLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.aiSubmitBtnText}>Sintonizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.aiContextBtn, ctxLoading && styles.aiBtnDisabled]}
              onPress={handleContextual}
              disabled={ctxLoading || aiLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="location" size={14} color={Colors.aiPurple} />
              <Text style={styles.aiContextBtnText}>Este momento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── THINKING STATE ── */}
        {(aiLoading || ctxLoading) && (
          <View style={styles.aiThinkingWrap}>
            <ThinkingDots />
          </View>
        )}

        {/* ── AI ERROR ── */}
        {!!aiError && !aiLoading && !ctxLoading && (
          <View style={styles.aiErrorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.textError} />
            <Text style={styles.aiErrorText}>{aiError}</Text>
          </View>
        )}

        {/* ── AI RESPONSE — message style ── */}
        {aiPlaylist && !aiLoading && !ctxLoading && (
          <View style={styles.aiResponse}>

            {/* Sender header */}
            <View style={styles.aiResponseSender}>
              <View style={styles.aiResponseDot} />
              <Text style={styles.aiResponseSenderText}>✦ Aether</Text>
            </View>

            {/* Playlist title */}
            <Text style={styles.aiResponseTitle}>{aiPlaylist.title}</Text>

            {/* Description */}
            <Text style={styles.aiResponseDesc}>{aiPlaylist.description}</Text>

            {/* Stations — horizontal scroll */}
            {aiPlaylist.stations.length > 0 ? (
              <>
                <FlatList
                  data={aiPlaylist.stations}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <StationCard
                      station={item}
                      isActive={currentStation?.id === item.id}
                      onPress={playStation}
                      enterAnim={new Animated.Value(1)}
                      layout="grid"
                    />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingTop: 4, paddingBottom: 16 }}
                />

                <View style={styles.aiSavePrompt}>
                  <Text style={styles.aiSavePromptText}>¿Te gusta lo que oyes? Guarda la lista</Text>
                  <TouchableOpacity 
                    style={styles.aiSavePromptBtn}
                    onPress={() => {
                      setSaveModalName(aiPlaylist.title.toLowerCase().replace(/[^a-záéíóúüñ0-9\s]/g, '').substring(0, 30));
                      setSaveModalVisible(true);
                    }}
                  >
                    <Ionicons name="bookmark" size={14} color="#fff" />
                    <Text style={styles.aiSavePromptBtnText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.aiResponseEmpty}>
                El éter no encontró emisoras para esto. Prueba con otras palabras.
              </Text>
            )}
          </View>
        )}

        {/* Emisoras Destacadas — only shown when there is data */}
        {(featuredLoading || featuredStations.length > 0) && (
          <Animated.View style={[styles.section, { transform: [{ translateY: sec0Slide }] }]}>
            <SectionHeader icon="⭐" title="Seleccionadas" />
            {featuredLoading ? renderSkeletons() : (
              <FlatList
                data={featuredStations}
                keyExtractor={item => item.id}
                renderItem={info => renderStation(info, featuredAnims, true)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, i) => ({ length: CARD_WIDTH + 12, offset: (CARD_WIDTH + 12) * i, index: i })}
              />
            )}
          </Animated.View>
        )}

        {/* Emisoras Cercanas */}
        <Animated.View style={[styles.section, { transform: [{ translateY: sec1Slide }] }]}>
          <SectionHeader
            icon="📍"
            title="Cerca de ti"
            onRefresh={fetchNearest}
            isLoading={nearestLoading}
          />

          {nearestLoading ? renderSkeletons()
            : locationDenied ? (
              <View style={styles.emptyBox}>
                <Ionicons name="location-outline" size={30} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Necesitamos tu ubicación.{'\n'}No la guardamos. Sin drama.</Text>
              </View>
            ) : nearestStations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="radio-outline" size={30} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>El éter está callado por aquí.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchNearest} activeOpacity={0.8}>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.retryBtnText}>Buscar de nuevo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={nearestStations}
                keyExtractor={item => item.id}
                renderItem={info => renderStation(info, nearestAnims)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, i) => ({ length: CARD_WIDTH + 12, offset: (CARD_WIDTH + 12) * i, index: i })}
              />
            )}
        </Animated.View>

        {/* Recomendadas para ti */}
        <Animated.View style={[styles.section, { transform: [{ translateY: sec2Slide }] }]}>
          <SectionHeader icon="✨" title="Hecho a tu medida" />

          {recommendedLoading ? renderSkeletons()
            : recommendedStations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Completa el cuestionario{'\n'}y esto se llena solo.</Text>
              </View>
            ) : (
              <FlatList
                data={recommendedStations}
                keyExtractor={item => item.id}
                renderItem={info => renderStation(info, forYouAnims)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, i) => ({ length: CARD_WIDTH + 12, offset: (CARD_WIDTH + 12) * i, index: i })}
              />
            )}
        </Animated.View>
      </Animated.ScrollView>

      {/* Save Modal */}
      <Modal visible={saveModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guardar lista</Text>
            <Text style={styles.modalDesc}>Dale un nombre a tu nueva colección.</Text>
            <TextInput
              style={styles.modalInput}
              value={saveModalName}
              onChangeText={setSaveModalName}
              maxLength={30}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleConfirmSave}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSaveModalVisible(false)} disabled={saveLoading}>
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, saveLoading && {opacity: 0.5}]} onPress={handleConfirmSave} disabled={saveLoading || !saveModalName.trim()}>
                <Text style={styles.modalConfirmBtnText}>{saveLoading ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cyan,
    letterSpacing: 5,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    padding: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },

  // Station card (skeleton only — real card is in StationCard.tsx)
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageFallback: {
    backgroundColor: 'rgba(102,252,241,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageFallbackText: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.cyan,
  },
  playingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.cyan,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartWrap: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardGenre: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  playBtnWrap: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  playBtnActive: {
    backgroundColor: Colors.cyanMuted,
  },

  // Skeleton
  skeletonCard: {
    backgroundColor: Colors.surface,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  skeletonImage: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.surfaceBorder,
  },
  skeletonLine: {
    marginHorizontal: 10,
    marginTop: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.surfaceBorder,
  },
  skeletonLineShort: {
    width: '50%',
    marginTop: 8,
  },

  // Empty states
  emptyBox: {
    marginHorizontal: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cyan,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    marginTop: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Featured card overrides
  cardFeatured: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadgeText: {
    fontSize: 12,
  },

  // ── AI Hero ───────────────────────────────────────────────────────────────
  aiHero: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: 'rgba(138,43,226,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.25)',
    padding: 18,
    gap: 14,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.aiPurple,
    letterSpacing: 1.5,
  },
  aiInput: {
    backgroundColor: Colors.void,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 68,
  },
  aiButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  aiSubmitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Colors.aiPurple,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: Colors.aiPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  aiSubmitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  aiContextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(138,43,226,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.30)',
    paddingVertical: 12,
  },
  aiContextBtnText: {
    color: Colors.aiPurple,
    fontWeight: '600',
    fontSize: 14,
  },
  aiBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  aiThinkingWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  aiErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,92,92,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,92,92,0.20)',
  },
  aiErrorText: {
    flex: 1,
    color: Colors.textError,
    fontSize: 13,
  },
  aiResponse: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: 'rgba(138,43,226,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.20)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.aiPurple,
    padding: 18,
    gap: 10,
  },
  aiResponseSender: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  aiResponseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.aiPurple,
  },
  aiResponseSenderText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.aiPurple,
    letterSpacing: 0.5,
  },
  aiResponseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  aiResponseDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  aiResponseEmpty: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // ── ThinkingDots ──────────────────────────────────────────────────────────
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thinkingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.aiPurple,
  },
  aiSavePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(100,108,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(100,108,255,0.2)',
  },
  aiSavePromptText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  aiSavePromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    gap: 6,
  },
  aiSavePromptBtnText: {
    color: Colors.void,
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: Colors.void,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.sm,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  modalConfirmBtnText: {
    color: Colors.void,
    fontSize: 14,
    fontWeight: '700',
  },
});
