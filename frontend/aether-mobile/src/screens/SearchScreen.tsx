import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Animated, Image, Easing, ActivityIndicator,
  Keyboard, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RadioStation } from '../types';
import { RootTabParamList } from '../types/navigation';
import api from '../api/axios';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineBanner } from '../components/OfflineBanner';
import { PlaylistPickerModal } from '../components/PlaylistPickerModal';
import { useTheme } from '../contexts/ThemeContext';

const getStyles = (colors: any) => StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.void,
  },
  container: {
    flex: 1,
    backgroundColor: colors.void,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.cyan,
    letterSpacing: 5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '600',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchRight: {
    marginLeft: 8,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.textPrimary,
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginLeft: 64,
  },

  // Result row
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
    backgroundColor: colors.surface,
  },
  rowLogoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cyanGlow,
  },
  rowLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cyan,
  },
  rowInfo: {
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  rowNameActive: {
    color: colors.cyan,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  iconBtn: {
    padding: 4,
    marginLeft: 8,
  },

  // Skeleton
  skeletonBlock: {
    backgroundColor: colors.surfaceBorder,
  },
  skeletonLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.surfaceBorder,
  },

  // Center states
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 12,
    paddingHorizontal: 32,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stateSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'name' | 'country' | 'genre';

interface SearchStation extends RadioStation {
  country?: string;
  countryCode?: string;
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'name',    label: 'Nombre', icon: 'radio-outline'     },
  { key: 'country', label: 'País',   icon: 'globe-outline'     },
  { key: 'genre',   label: 'Género', icon: 'musical-notes-outline' },
];

interface FilterChipProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}
const FilterChip: React.FC<FilterChipProps> = ({ label, icon, active, onPress }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons name={icon as any} size={13} color={active ? '#fff' : colors.textSecondary} />
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Result row ───────────────────────────────────────────────────────────────

interface ResultRowProps {
  station: SearchStation;
  isActive: boolean;
  onPlay: (s: RadioStation) => void;
  onAddToList: (s: SearchStation) => void;
  enterAnim: Animated.Value;
}
const ResultRow: React.FC<ResultRowProps> = ({ station, isActive, onPlay, onAddToList, enterAnim }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [imgError, setImgError] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav     = isFavorite(station.id);
  const hasLogo = !!station.logoUrl && !imgError;

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 0.65, tension: 200, friction: 5, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1.35, tension: 100, friction: 4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1,    tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();
    toggleFavorite(station);
  };

  const opacity    = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  const meta = [station.country, station.genre?.split(',')[0]?.trim()]
    .filter(Boolean).join(' · ');

  return (
    <Animated.View style={[styles.row, { opacity, transform: [{ translateY }] }]}>
      {/* Logo */}
      {hasLogo ? (
        <Image
          source={{ uri: station.logoUrl }}
          style={styles.rowLogo}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.rowLogo, styles.rowLogoFallback]}>
          <Text style={styles.rowLogoText}>
            {station.name?.charAt(0)?.toUpperCase() ?? '🎵'}
          </Text>
        </View>
      )}

      {/* Info */}
      <TouchableOpacity style={styles.rowInfo} onPress={() => onPlay(station)} activeOpacity={0.7}>
        <Text style={[styles.rowName, isActive && styles.rowNameActive]} numberOfLines={1}>
          {station.name}
        </Text>
        {!!meta && (
          <Text style={styles.rowMeta} numberOfLines={1}>{meta}</Text>
        )}
      </TouchableOpacity>

      {/* Playing indicator */}
      {isActive && (
        <Ionicons name="musical-notes" size={14} color={colors.cyan} style={{ marginRight: 8 }} />
      )}

      {/* Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => onAddToList(station)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconBtn}
        >
          <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <TouchableOpacity
            onPress={handleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.iconBtn}
          >
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={20}
              color={fav ? colors.favorite : colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow: React.FC<{ pulse: Animated.Value }> = ({ pulse }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });
  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={[styles.rowLogo, styles.skeletonBlock]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { width: '65%' }]} />
        <View style={[styles.skeletonLine, { width: '40%' }]} />
      </View>
    </Animated.View>
  );
};

// ─── SearchScreen ─────────────────────────────────────────────────────────────

export const SearchScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { playStation, currentStation } = useAudio();
  const { addStationToPlaylist } = usePlaylists();
  const { isOnline } = useNetworkStatus();
  
  const route = useRoute<RouteProp<RootTabParamList, 'SearchTab'>>();
  const navigation = useNavigation<any>();
  const targetPlaylistId = route.params?.targetPlaylistId;

  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState<FilterType>('name');
  const [results, setResults]     = useState<SearchStation[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<SearchStation | null>(null);

  const openPicker = (s: SearchStation) => {
    setSelectedStation(s);
    setPickerVisible(true);
  };

  // ── Animations ────────────────────────────────────────────────────────────
  const masterFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;
  const pulse       = useRef(new Animated.Value(0)).current;
  const rowAnims    = useRef(Array.from({ length: 20 }, () => new Animated.Value(0))).current;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Screen entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(masterFade,  { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Stagger results when they arrive
  const staggerRows = useCallback((count: number) => {
    rowAnims.forEach(a => a.setValue(0));
    Animated.stagger(
      45,
      rowAnims.slice(0, count).map(a =>
        Animated.spring(a, { toValue: 1, tension: 75, friction: 10, useNativeDriver: true })
      )
    ).start();
  }, []);

  // ── Debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(query.trim(), filter), 550);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filter]);

  const doSearch = async (q: string, type: FilterType) => {
    if (!isOnline) {
      Alert.alert('Sin conexión', 'La búsqueda no está disponible sin conexión a Internet.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/radio/search', { params: { q, type } });
      setResults(res.data);
      setSearched(true);
      staggerRows(res.data.length);
    } catch (e: any) {
      setError('No se pudo realizar la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setError(null);
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setResults([]);
    setSearched(false);
  };

  const handleStationPress = async (station: SearchStation) => {
    if (targetPlaylistId) {
      try {
        await addStationToPlaylist(targetPlaylistId, station);
        Alert.alert('Añadida', `"${station.name}" se ha añadido a la lista.`);
      } catch (e) {
        Alert.alert('Error', 'No se pudo añadir la emisora a la lista.');
      }
    } else {
      playStation(station);
    }
  };

  // ── Render content ────────────────────────────────────────────────────────

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.listContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <SkeletonRow pulse={pulse} />
              {i < 5 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={52} color="#2D2D4A" />
          <Text style={styles.stateTitle}>Error de conexión</Text>
          <Text style={styles.stateSub}>{error}</Text>
        </View>
      );
    }

    if (searched && results.length === 0) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="search-outline" size={52} color="#2D2D4A" />
          <Text style={styles.stateTitle}>Sin resultados</Text>
          <Text style={styles.stateSub}>
            No encontramos emisoras para "{query}"
          </Text>
        </View>
      );
    }

    if (!searched) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="radio-outline" size={52} color="#2D2D4A" />
          <Text style={styles.stateTitle}>Busca una emisora</Text>
          <Text style={styles.stateSub}>
            Escribe al menos 2 caracteres{'\n'}para empezar
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ResultRow
            station={item}
            isActive={currentStation?.id === item.id}
            onPlay={handleStationPress}
            onAddToList={openPicker}
            enterAnim={rowAnims[index] ?? new Animated.Value(1)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </Text>
        }
      />
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.rootContainer}>
      <OfflineBanner isOnline={isOnline} />
      <Animated.View style={[styles.container, { opacity: masterFade }]}>

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
        {targetPlaylistId && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.cyan} />
            <Text style={styles.backText}>Volver a la lista</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.appName}>AETHER</Text>
        <Text style={styles.title}>{targetPlaylistId ? 'Añadir emisoras' : 'Buscar'}</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9399B2" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nombre, país o género..."
            placeholderTextColor="#9399B2"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim().length >= 2) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                doSearch(query.trim(), filter);
              }
              Keyboard.dismiss();
            }}
          />
          {loading ? (
            <ActivityIndicator size="small" color={colors.cyan} style={styles.searchRight} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={handleClear} style={styles.searchRight}>
              <Ionicons name="close-circle" size={18} color="#9399B2" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <FilterChip
              key={f.key}
              label={f.label}
              icon={f.icon}
              active={filter === f.key}
              onPress={() => handleFilterChange(f.key)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Results / states */}
      {renderContent()}

      <PlaylistPickerModal
        visible={pickerVisible}
        station={selectedStation}
        onClose={() => setPickerVisible(false)}
      />

    </Animated.View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────


