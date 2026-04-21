import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Animated, Image, Easing, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '../types/navigation';
import { useAudio } from '../contexts/AudioContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { RadioStation } from '../types';
import api from '../api/axios';
import { saveHomeStations, getHomeStations } from '../db/database';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineBanner } from '../components/OfflineBanner';

const CARD_WIDTH    = 160;
const CARD_HEIGHT   = 200;
const SKELETON_COUNT = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días',   emoji: '☀️' };
  if (h < 19) return { text: 'Buenas tardes', emoji: '🌤️' };
  return       { text: 'Buenas noches',       emoji: '🌙' };
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

// ─── Station card ─────────────────────────────────────────────────────────────

interface StationCardProps {
  station: RadioStation;
  isActive: boolean;
  onPress: (station: RadioStation) => void;
  enterAnim: Animated.Value;
  featured?: boolean;
}

const StationCard: React.FC<StationCardProps> = ({ station, isActive, onPress, enterAnim, featured }) => {
  const [imgError, setImgError] = useState(false);
  const playScale  = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(station.id);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(playScale, { toValue: 0.88, tension: 150, friction: 5, useNativeDriver: true }),
      Animated.spring(playScale, { toValue: 1,    tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(station);
  };

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 0.7, tension: 200, friction: 5, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1.3, tension: 100, friction: 4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1,   tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    toggleFavorite(station);
  };

  const translateY = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const opacity    = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0,  1] });
  const hasLogo    = !!station.logoUrl && !imgError;

  return (
    <Animated.View style={[styles.card, featured && styles.cardFeatured, { opacity, transform: [{ translateY }] }]}>
      {/* Logo */}
      <View style={styles.cardImageContainer}>
        {hasLogo ? (
          <Image
            source={{ uri: station.logoUrl }}
            style={styles.cardImage}
            onError={() => setImgError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImage, styles.cardImageFallback]}>
            <Text style={styles.cardImageFallbackText}>
              {station.name?.charAt(0)?.toUpperCase() ?? '🎵'}
            </Text>
          </View>
        )}

        {featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐</Text>
          </View>
        )}

        {isActive && (
          <View style={styles.playingBadge}>
            <Ionicons name="musical-notes" size={11} color="#fff" />
          </View>
        )}

        {/* Heart button */}
        <Animated.View style={[styles.heartWrap, { transform: [{ scale: heartScale }] }]}>
          <TouchableOpacity onPress={handleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={18}
              color={fav ? '#ff4d7d' : 'rgba(255,255,255,0.75)'}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{station.name}</Text>
        {!!station.genre && (
          <Text style={styles.cardGenre} numberOfLines={1}>
            · {station.genre.split(',')[0].trim()}
          </Text>
        )}
      </View>

      {/* Play button */}
      <Animated.View style={[styles.playBtnWrap, { transform: [{ scale: playScale }] }]}>
        <TouchableOpacity
          style={[styles.playBtn, isActive && styles.playBtnActive]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={14}
            color="#fff"
            style={{ marginLeft: isActive ? 0 : 2 }}
          />
        </TouchableOpacity>
      </Animated.View>
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
          color={isLoading ? SUBTEXT : ACCENT} 
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

  const [userName, setUserName]                     = useState('');
  const [featuredStations, setFeaturedStations]     = useState<RadioStation[]>([]);
  const [nearestStations, setNearestStations]       = useState<RadioStation[]>([]);
  const [recommendedStations, setRecommended]       = useState<RadioStation[]>([]);
  const [featuredLoading, setFeaturedLoading]       = useState(true);
  const [nearestLoading, setNearestLoading]         = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [locationDenied, setLocationDenied]         = useState(false);

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

  // Skeleton shimmer loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Screen entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(masterFade,  { toValue: 1, duration: 550, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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

  // ── Data fetching ───────────────────────────────────────────────────────────
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
      // ── STEP 1: Check permission status ──────────────────────────────────────
      console.log('[GPS-1] Checking location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[GPS-1] Permission status:', status);
      if (status !== 'granted') { setLocationDenied(true); setNearestLoading(false); return; }

      let location: Location.LocationObject | null = null;

      // ── STEP 2: Try last known position ──────────────────────────────────────
      console.log('[GPS-2] Trying getLastKnownPositionAsync...');
      try {
        location = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
        console.log('[GPS-2] Result:', location ? `Lat ${location.coords.latitude}, Lon ${location.coords.longitude}` : 'null (no cached position)');
      } catch (e: any) {
        console.log('[GPS-2] Error:', e.message);
      }

      // ── STEP 3: Try getCurrentPosition (Balanced) ─────────────────────────
      if (!location) {
        console.log('[GPS-3] Trying getCurrentPositionAsync (Balanced)...');
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          console.log('[GPS-3] OK:', location.coords.latitude, location.coords.longitude);
        } catch (e: any) {
          console.log('[GPS-3] Error:', e.message);
        }
      }

      // ── STEP 4: Try getCurrentPosition (Lowest) ───────────────────────────
      if (!location) {
        console.log('[GPS-4] Trying getCurrentPositionAsync (Lowest)...');
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
          console.log('[GPS-4] OK:', location.coords.latitude, location.coords.longitude);
        } catch (gpsErr: any) {
          console.log('[GPS-4] Final error:', gpsErr.message);
          throw new Error(`location: ${gpsErr.message}`);
        }
      }

      // ── STEP 5: Call API ──────────────────────────────────────────────────
      const { latitude, longitude } = location!.coords;
      console.log(`[GPS-OK] Final coords → Lat: ${latitude}, Lon: ${longitude}`);

      const res = await api.post('/api/radio/nearest', { latitude, longitude });
      setNearestStations(res.data);
      staggerCards(nearestAnims.slice(0, res.data.length));
      saveHomeStations(res.data, 'nearest').catch(() => {});
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
      saveHomeStations(res.data, 'foryou').catch(() => {});
    } catch (e: any) {
      console.log('ForYou fetch handled error:', e.message || e);
      const cached = await getHomeStations('foryou').catch(() => []);
      setRecommended(cached);
      staggerCards(forYouAnims.slice(0, cached.length));
    } finally {
      setRecommendedLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
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

  // ── Render helpers ──────────────────────────────────────────────────────────
  const greeting = getGreeting();

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
    <View style={styles.rootContainer}>
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
          <Text style={styles.greeting}>
            {greeting.text}{userName ? `, ${userName}` : ''} {greeting.emoji}
          </Text>
          <Text style={styles.greetingSub}>Descubre tu próxima emisora favorita</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#9399B2" />
        </TouchableOpacity>
      </Animated.View>

      {/* Emisoras Destacadas — only shown when there is data */}
      {(featuredLoading || featuredStations.length > 0) && (
        <Animated.View style={[styles.section, { transform: [{ translateY: sec0Slide }] }]}>
          <SectionHeader icon="⭐" title="Emisoras Destacadas" />
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
          title="Emisoras Cercanas" 
          onRefresh={fetchNearest} 
          isLoading={nearestLoading}
        />

        {nearestLoading ? renderSkeletons()
          : locationDenied ? (
            <View style={styles.emptyBox}>
              <Ionicons name="location-outline" size={30} color="#9399B2" />
              <Text style={styles.emptyText}>Activa la ubicación para ver{'\n'}emisoras cercanas</Text>
            </View>
          ) : nearestStations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="radio-outline" size={30} color="#9399B2" />
              <Text style={styles.emptyText}>No hay emisoras disponibles en tu zona</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchNearest} activeOpacity={0.8}>
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.retryBtnText}>Reintentar</Text>
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
        <SectionHeader icon="✨" title="Recomendadas para ti" />

        {recommendedLoading ? renderSkeletons()
          : recommendedStations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Completa el cuestionario para{'\n'}ver recomendaciones</Text>
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
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const ACCENT     = '#646cff';
const ACCENT_DIM = 'rgba(100,108,255,0.18)';
const BG         = '#0E0E1A';
const SURFACE    = '#16162A';
const BORDER     = '#2D2D4A';
const TEXT       = '#FFFFFF';
const SUBTEXT    = '#9399B2';

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
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
    color: ACCENT,
    letterSpacing: 5,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 13,
    color: SUBTEXT,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
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
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },

  // Station card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
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
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageFallbackText: {
    fontSize: 34,
    fontWeight: '700',
    color: ACCENT,
  },
  playingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: ACCENT,
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
    color: TEXT,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardGenre: {
    fontSize: 11,
    color: SUBTEXT,
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
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  playBtnActive: {
    backgroundColor: '#4a52d4',
  },

  // Skeleton
  skeletonCard: {
    backgroundColor: SURFACE,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  skeletonImage: {
    width: '100%',
    height: 100,
    backgroundColor: BORDER,
  },
  skeletonLine: {
    marginHorizontal: 10,
    marginTop: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BORDER,
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
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: SUBTEXT,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Featured card overrides
  cardFeatured: {
    borderColor: '#f59e0b',
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
});
