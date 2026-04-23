import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RadioStation } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';

export interface StationCardProps {
  station: RadioStation;
  isActive: boolean;
  onPress: (station: RadioStation) => void;
  enterAnim: Animated.Value;
  featured?: boolean;
  style?: StyleProp<ViewStyle>;
  layout?: 'grid' | 'row';
}

export const StationCard: React.FC<StationCardProps> = ({ station, isActive, onPress, enterAnim, featured, style, layout = 'grid' }) => {
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

  if (layout === 'row') {
    return (
      <Animated.View style={[styles.rowCard, isActive && styles.rowCardActive, { opacity, transform: [{ translateY }] }, style]}>
        <TouchableOpacity style={styles.rowCardInner} onPress={handlePress} activeOpacity={0.75}>
          {hasLogo ? (
            <Image
              source={{ uri: station.logoUrl }}
              style={styles.rowCardLogo}
              onError={() => setImgError(true)}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.rowCardLogo, styles.rowCardLogoFallback]}>
              <Text style={styles.rowCardLogoText}>{station.name?.[0]?.toUpperCase() ?? '♫'}</Text>
            </View>
          )}

          <View style={styles.rowCardInfo}>
            <Text style={[styles.rowCardName, isActive && styles.rowCardNameActive]} numberOfLines={1}>
              {station.name}
            </Text>
            {!!station.genre && (
              <Text style={styles.rowCardGenre} numberOfLines={1}>{station.genre.split(',')[0]}</Text>
            )}
          </View>

          <View style={styles.rowCardActions}>
            <Animated.View style={[{ transform: [{ scale: heartScale }] }]}>
              <TouchableOpacity onPress={handleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 12 }}>
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? '#ff4d7d' : SUBTEXT} />
              </TouchableOpacity>
            </Animated.View>
            <View style={styles.rowCardPlay}>
              {isActive ? (
                <Ionicons name="musical-notes" size={18} color={ACCENT} />
              ) : (
                <Ionicons name="play-circle-outline" size={24} color={SUBTEXT} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, featured && styles.cardFeatured, { opacity, transform: [{ translateY }] }, style]}>
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

const CARD_WIDTH    = 160;
const CARD_HEIGHT   = 200;
const ACCENT     = '#646cff';
const ACCENT_DIM = 'rgba(100,108,255,0.18)';
const SURFACE    = '#16162A';
const BORDER     = '#2D2D4A';
const TEXT       = '#FFFFFF';
const SUBTEXT    = '#9399B2';

const styles = StyleSheet.create({
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
  
  rowCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  rowCardActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(100,108,255,0.08)',
  },
  rowCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  rowCardLogo: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: BORDER,
  },
  rowCardLogoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100,108,255,0.18)',
  },
  rowCardLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
  },
  rowCardInfo: {
    flex: 1,
    gap: 3,
  },
  rowCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
  rowCardNameActive: {
    color: ACCENT,
  },
  rowCardGenre: {
    fontSize: 12,
    color: SUBTEXT,
  },
  rowCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCardPlay: {
    width: 32,
    alignItems: 'center',
  },
});
