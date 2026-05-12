import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  Animated, Easing, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Radius, Shadows } from '../theme/theme';
import { useTheme } from '../contexts/ThemeContext';
import { PlaylistPickerModal } from '../components/PlaylistPickerModal';

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
    paddingTop: 20,
  },

  // ── Loading / empty ────────────────────────────────────────────────────────
  tuningText: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  noStationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  noStationSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.surface,
  },
  logoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102,252,241,0.08)',
  },
  logoFallbackText: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.cyan,
  },
  glowRing: {
    position: 'absolute',
    width: 236,
    height: 236,
    borderRadius: 118,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  glowRingActive: {
    borderColor: colors.cyanGlow,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },

  // ── Info ──────────────────────────────────────────────────────────────────
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  stationName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 30,
  },
  genre: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 14,
    textTransform: 'capitalize',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  liveDotActive: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,77,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.3)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
    width: '100%',
  },
  errorText: {
    color: colors.textError,
    fontSize: 13,
    flex: 1,
  },

  // ── Controls ──────────────────────────────────────────────────────────────
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  sideBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  playBtnPaused: {
    backgroundColor: colors.cyanMuted,
    shadowOpacity: 0.2,
  },
});

export const PlayerScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { currentStation, isPlaying, loading, locationStatus, togglePlayback, error } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgError, setImgError] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  // ── Animations ────────────────────────────────────────────────────────────
  const contentFade  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.85)).current;
  const playBtnScale = useRef(new Animated.Value(1)).current;
  const heartScale   = useRef(new Animated.Value(1)).current;
  const spinAnim     = useRef(new Animated.Value(0)).current;

  // Spin animation for logo when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [isPlaying]);

  // Entrance animation when station loads
  useEffect(() => {
    if (currentStation && !loading) {
      setImgError(false);
      contentFade.setValue(0);
      logoScale.setValue(0.85);
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 50,   friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [currentStation?.id, loading]);

  const handlePlayToggle = () => {
    Animated.sequence([
      Animated.spring(playBtnScale, { toValue: 0.88, tension: 150, friction: 5, useNativeDriver: true }),
      Animated.spring(playBtnScale, { toValue: 1,    tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    togglePlayback();
  };

  const handleFavorite = () => {
    if (!currentStation) return;
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 0.6, tension: 200, friction: 5, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1.4, tension: 100, friction: 4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1,   tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    toggleFavorite(currentStation);
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.tuningText}>Sintonizando el éter...</Text>
        <ActivityIndicator size="large" color={colors.cyan} />
        <Text style={styles.loadingText}>{locationStatus}</Text>
      </View>
    );
  }

  // ── No station ─────────────────────────────────────────────────────────────
  if (!currentStation) {
    return (
      <View style={styles.container}>
        <Ionicons name="radio-outline" size={80} color={colors.surfaceBorder} />
        <Text style={styles.noStationTitle}>Aquí no hay nada sonando.</Text>
        <Text style={styles.noStationSub}>Elige una emisora desde Ondas{'\n'}y vuelve aquí.</Text>
      </View>
    );
  }

  const fav     = isFavorite(currentStation.id);
  const hasLogo = !!currentStation.logoUrl && !imgError;

  // ── Player ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: contentFade }]}>

        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: logoScale }, { rotate: isPlaying ? spin : '0deg' }] }]}>
          {hasLogo ? (
            <Image
              source={{ uri: currentStation.logoUrl }}
              style={styles.logo}
              onError={() => setImgError(true)}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoFallbackText}>
                {currentStation.name?.charAt(0)?.toUpperCase() ?? '🎵'}
              </Text>
            </View>
          )}

          {/* Glow ring */}
          <View style={[styles.glowRing, isPlaying && styles.glowRingActive]} />
        </Animated.View>

        {/* Station info */}
        <View style={styles.infoSection}>
          <Text style={styles.stationName} numberOfLines={2}>{currentStation.name}</Text>
          {!!currentStation.genre && (
            <Text style={styles.genre} numberOfLines={1}>
              {currentStation.genre.split(',')[0].trim()}
            </Text>
          )}
          {/* Live pill */}
          <View style={styles.livePill}>
            <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
            <Text style={[styles.liveText, isPlaying && { color: colors.cyan }]}>{isPlaying ? 'EN DIRECTO' : 'PAUSADO'}</Text>
          </View>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color="#ff4d4d" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {/* Heart */}
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity onPress={handleFavorite} style={styles.sideBtn}>
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={28}
                color={fav ? colors.favorite : colors.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Play / Pause */}
          <Animated.View style={{ transform: [{ scale: playBtnScale }] }}>
            <TouchableOpacity
              style={[styles.playBtn, !isPlaying && styles.playBtnPaused]}
              onPress={handlePlayToggle}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={30}
                color="#fff"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Add to playlist */}
          <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.sideBtn}>
            <Ionicons name="list-outline" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

      </Animated.View>

      <PlaylistPickerModal
        visible={pickerVisible}
        station={currentStation}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────


