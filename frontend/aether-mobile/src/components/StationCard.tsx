import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RadioStation } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { Colors, Radius, Shadows } from '../theme/theme';

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
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? Colors.favorite : Colors.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
            <View style={styles.rowCardPlay}>
              {isActive ? (
                <Ionicons name="musical-notes" size={18} color={Colors.cyan} />
              ) : (
                <Ionicons name="play-circle-outline" size={24} color={Colors.textSecondary} />
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
              color={fav ? Colors.favorite : 'rgba(255,255,255,0.75)'}
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

const CARD_WIDTH  = 160;
const CARD_HEIGHT = 200;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    ...Shadows.card,
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
    ...Shadows.cyan,
  },
  playBtnActive: {
    backgroundColor: Colors.cyanMuted,
  },
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

  rowCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  rowCardActive: {
    borderColor: Colors.cyan,
    backgroundColor: Colors.surfaceActive,
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
    backgroundColor: Colors.surfaceBorder,
  },
  rowCardLogoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102,252,241,0.08)',
  },
  rowCardLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.cyan,
  },
  rowCardInfo: {
    flex: 1,
    gap: 3,
  },
  rowCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowCardNameActive: {
    color: Colors.cyan,
  },
  rowCardGenre: {
    fontSize: 12,
    color: Colors.textSecondary,
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
