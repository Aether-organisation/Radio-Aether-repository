import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Image, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../contexts/AudioContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Colors, Radius } from '../theme/theme';
import { PlaylistPickerModal } from './PlaylistPickerModal';

export const MiniPlayer = () => {
  const { currentStation, isPlaying, togglePlayback } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigation = useNavigation<any>();
  const [imgError, setImgError] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const slideAnim   = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentStation) {
      setImgError(false);
      Animated.parallel([
        Animated.spring(slideAnim,   { toValue: 0,  tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1,  duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim,   { toValue: 80, duration: 250, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0,  duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [!!currentStation]);

  useEffect(() => {
    if (currentStation && isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1.04, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breatheAnim, { toValue: 1.0,  duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      breatheAnim.setValue(1);
    }
  }, [isPlaying, !!currentStation]);

  if (!currentStation) return null;

  const fav     = isFavorite(currentStation.id);
  const hasLogo = !!currentStation.logoUrl && !imgError;

  const goToPlayer = () => navigation.navigate('MainTabs', { screen: 'NowPlayingTab' });

  return (
    <>
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
      <View style={styles.topBorder} />
      <TouchableOpacity style={styles.inner} onPress={goToPlayer} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
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
                {currentStation.name?.charAt(0)?.toUpperCase() ?? '♪'}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.info}>
          <Text style={styles.stationName} numberOfLines={1}>{currentStation.name}</Text>
          {!!currentStation.genre && (
            <Text style={styles.genre} numberOfLines={1}>
              {currentStation.genre.split(',')[0].trim()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(currentStation)}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={20}
            color={fav ? Colors.favorite : Colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          <Ionicons name="list-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayback}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={32}
            color={Colors.cyan}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>

    <PlaylistPickerModal
      visible={pickerVisible}
      station={currentStation}
      onClose={() => setPickerVisible(false)}
    />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    right: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1000,
    overflow: 'hidden',
  },
  topBorder: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 1,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  logoFallback: {
    backgroundColor: 'rgba(102,252,241,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.cyan,
  },
  info: {
    flex: 1,
  },
  stationName: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  genre: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  iconBtn: {
    padding: 2,
  },
});
