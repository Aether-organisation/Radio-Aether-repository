import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Image, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { useAudio } from '../contexts/AudioContext';
import { useNavigation } from '@react-navigation/native';
import { RadioStation } from '../types';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineBanner } from '../components/OfflineBanner';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type View_ = 'library' | 'favorites';

// ─── Fila de emisora dentro de una lista ─────────────────────────────────────

interface StationRowProps {
  station: RadioStation;
  isActive: boolean;
  onPlay: (s: RadioStation) => void;
  onRemove: (s: RadioStation) => void;
  enterAnim: Animated.Value;
}

const StationRow: React.FC<StationRowProps> = ({ station, isActive, onPlay, onRemove, enterAnim }) => {
  const [imgError, setImgError] = React.useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const hasLogo = !!station.logoUrl && !imgError;

  const handleRemove = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 0.7, tension: 200, friction: 5, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1.3, tension: 100, friction: 4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1,   tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start(() => onRemove(station));
  };

  const opacity    = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateX = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });

  return (
    <Animated.View style={[styles.row, { opacity, transform: [{ translateX }] }]}>
      {hasLogo ? (
        <Image
          source={{ uri: station.logoUrl }}
          style={styles.rowLogo}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.rowLogo, styles.rowLogoFallback]}>
          <Text style={styles.rowLogoFallbackText}>
            {station.name?.charAt(0)?.toUpperCase() ?? '🎵'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.rowInfo} onPress={() => onPlay(station)} activeOpacity={0.7}>
        <Text style={[styles.rowName, isActive && styles.rowNameActive]} numberOfLines={1}>
          {station.name}
        </Text>
        {!!station.genre && (
          <Text style={styles.rowGenre} numberOfLines={1}>
            {station.genre.split(',')[0].trim()}
          </Text>
        )}
      </TouchableOpacity>

      {isActive && (
        <Ionicons name="musical-notes" size={14} color={ACCENT} style={{ marginRight: 8 }} />
      )}

      <Animated.View style={{ transform: [{ scale: heartScale }] }}>
        <TouchableOpacity
          onPress={handleRemove}
          style={styles.rowHeartBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart" size={20} color="#ff4d7d" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Tarjeta de lista en la vista principal ───────────────────────────────────

interface ListCardProps {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  count: number;
  onPress: () => void;
  enterAnim: Animated.Value;
}

const ListCard: React.FC<ListCardProps> = ({ icon, iconBg, title, description, count, onPress, enterAnim }) => {
  const scale   = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] });
  const opacity = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.listCardIcon, { backgroundColor: iconBg }]}>
          <Text style={styles.listCardEmoji}>{icon}</Text>
        </View>
        <View style={styles.listCardInfo}>
          <Text style={styles.listCardTitle}>{title}</Text>
          <Text style={styles.listCardDesc}>{description}</Text>
        </View>
        <View style={styles.listCardRight}>
          <Text style={styles.listCardCount}>{count}</Text>
          <Ionicons name="chevron-forward" size={16} color={SUBTEXT} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── LibraryScreen ────────────────────────────────────────────────────────────

export const LibraryScreen = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { playlists } = usePlaylists();
  const { playStation, currentStation } = useAudio();
  const navigation = useNavigation<any>();
  const { isOnline } = useNetworkStatus();
  const [currentView, setCurrentView] = useState<View_>('library');

  // Animations
  const masterFade   = useRef(new Animated.Value(0)).current;
  const headerSlide  = useRef(new Animated.Value(-12)).current;
  const viewSlide    = useRef(new Animated.Value(0)).current;
  const cardAnim     = useRef(new Animated.Value(0)).current;
  const rowAnims     = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;

  // Entrada inicial
  useEffect(() => {
    Animated.parallel([
      Animated.timing(masterFade,  { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(150),
        Animated.spring(cardAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Animar filas cuando se entra en la lista de favoritos
  useEffect(() => {
    if (currentView === 'favorites' && favorites.length > 0) {
      favorites.forEach((_, i) => rowAnims[i].setValue(0));
      Animated.stagger(
        50,
        favorites.map((_, i) =>
          Animated.spring(rowAnims[i], { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
        )
      ).start();
    }
  }, [currentView]);

  const navigateTo = (view: View_) => {
    Animated.timing(viewSlide, { toValue: view === 'favorites' ? -1 : 0, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
    setCurrentView(view);
  };

  // ── Vista principal de biblioteca ─────────────────────────────────────────
  const renderLibrary = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.libraryScrollContent}
    >
      <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
        <Text style={styles.appName}>AETHER</Text>
        <Text style={styles.title}>Biblioteca</Text>
        <Text style={styles.subtitle}>Tus colecciones de emisoras</Text>
      </Animated.View>

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>MIS LISTAS</Text>
      </View>

      <ListCard
        icon="❤️"
        iconBg="rgba(255,77,125,0.15)"
        title="Mis Favoritas"
        description="Emisoras que has guardado"
        count={favorites.length}
        onPress={() => navigateTo('favorites')}
        enterAnim={cardAnim}
      />

      <View style={[styles.sectionLabel, { marginTop: 20 }]}>
        <Text style={styles.sectionLabelText}>LISTAS PERSONALIZADAS</Text>
      </View>

      {playlists.length === 0 ? (
        <Animated.View style={[styles.comingSoonCard, { opacity: cardAnim }]}>
          <Ionicons name="list" size={22} color={SUBTEXT} />
          <Text style={styles.comingSoonText}>Aún no has creado listas</Text>
        </Animated.View>
      ) : (
        playlists.map((pl, i) => (
          <ListCard
            key={pl.id}
            icon="📻"
            iconBg="rgba(100,108,255,0.15)"
            title={pl.name}
            description="Lista de emisoras"
            count={pl.stations.length}
            onPress={() => navigation.navigate('PlaylistDetail', { playlistId: pl.id })}
            enterAnim={cardAnim}
          />
        ))
      )}
    </ScrollView>
  );

  // ── Vista de favoritos ────────────────────────────────────────────────────
  const renderFavorites = () => (
    <>
      <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
        <TouchableOpacity onPress={() => navigateTo('library')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={ACCENT} />
          <Text style={styles.backText}>Biblioteca</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Favoritas</Text>
        <Text style={styles.subtitle}>
          {favorites.length === 0
            ? 'Aún no tienes favoritas'
            : `${favorites.length} emisora${favorites.length !== 1 ? 's' : ''}`}
        </Text>
      </Animated.View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#2D2D4A" />
          <Text style={styles.emptyTitle}>Sin favoritas todavía</Text>
          <Text style={styles.emptyText}>
            Toca el corazón en cualquier emisora{'\n'}para guardarla aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <StationRow
              station={item}
              isActive={currentStation?.id === item.id}
              onPlay={playStation}
              onRemove={toggleFavorite}
              enterAnim={rowAnims[index] ?? new Animated.Value(1)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </>
  );

  return (
    <View style={styles.rootContainer}>
      <OfflineBanner isOnline={isOnline} />
      <Animated.View style={[styles.container, { opacity: masterFade }]}>
        {currentView === 'library' ? renderLibrary() : renderFavorites()}
      </Animated.View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const ACCENT  = '#646cff';
const BG      = '#0E0E1A';
const SURFACE = '#16162A';
const BORDER  = '#2D2D4A';
const TEXT    = '#FFFFFF';
const SUBTEXT = '#9399B2';

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: SUBTEXT,
  },

  // Back button
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },

  // Section label
  sectionLabel: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: SUBTEXT,
    letterSpacing: 2,
  },

  // List card (en vista biblioteca)
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 14,
  },
  listCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardEmoji: {
    fontSize: 26,
  },
  listCardInfo: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 3,
  },
  listCardDesc: {
    fontSize: 12,
    color: SUBTEXT,
  },
  listCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listCardCount: {
    fontSize: 14,
    fontWeight: '700',
    color: SUBTEXT,
  },

  // Coming soon
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
    gap: 10,
  },
  comingSoonText: {
    color: SUBTEXT,
    fontSize: 14,
  },

  // Favorites list
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
  },
  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 66,
  },

  // Station row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: SURFACE,
  },
  rowLogoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100,108,255,0.18)',
  },
  rowLogoFallbackText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
  },
  rowInfo: {
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 3,
  },
  rowNameActive: {
    color: ACCENT,
  },
  rowGenre: {
    fontSize: 12,
    color: SUBTEXT,
  },
  rowHeartBtn: {
    padding: 4,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  emptyText: {
    fontSize: 14,
    color: SUBTEXT,
    textAlign: 'center',
    lineHeight: 22,
  },
  libraryScrollContent: {
    paddingBottom: 120,
  },
});
