import React, { useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Animated, Image, Easing, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { useAudio } from '../contexts/AudioContext';
import { RadioStation } from '../types';
import { RootStackParamList } from '../types/navigation';

export const PlaylistDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlaylistDetail'>>();
  const navigation = useNavigation<any>();
  const { playlistId } = route.params;

  const { playlists, removeStationFromPlaylist, deletePlaylist } = usePlaylists();
  const { playStation, currentStation } = useAudio();

  const playlist = playlists.find(p => p.id === playlistId);

  // Animations
  const masterFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;
  const rowAnims    = useRef(Array.from({ length: 100 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(masterFade,  { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (playlist && playlist.stations.length > 0) {
      playlist.stations.forEach((_, i) => rowAnims[i]?.setValue(0));
      Animated.stagger(
        50,
        playlist.stations.map((_, i) =>
          Animated.spring(rowAnims[i], { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
        )
      ).start();
    }
  }, [playlist?.stations.length]);

  if (!playlist) {
    return (
      <View style={styles.rootContainer}>
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 100}}>Lista no encontrada</Text>
      </View>
    );
  }

  const handleAddStations = () => {
    navigation.navigate('MainTabs', {
      screen: 'SearchTab',
      params: { targetPlaylistId: playlist.id }
    });
  };

  const handleRemove = (s: RadioStation) => {
    Alert.alert('Quitar emisora', `¿Quitar "${s.name}" de esta lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => removeStationFromPlaylist(playlist.id, s.id) }
    ]);
  };

  const handleDeletePlaylist = () => {
    Alert.alert('Eliminar lista', `¿Eliminar "${playlist.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await deletePlaylist(playlist.id);
        navigation.goBack();
      }}
    ]);
  };

  const renderStation = ({ item, index }: { item: any, index: number }) => {
    const station: RadioStation = {
      id: item.stationId,
      name: item.stationName,
      logoUrl: item.logoUrl,
      streamUrl: item.streamUrl,
      genre: item.genre,
    };
    const isActive = currentStation?.id === station.id;
    const enterAnim = rowAnims[index] ?? new Animated.Value(1);

    const opacity    = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const translateX = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });

    return (
      <Animated.View style={[styles.row, { opacity, transform: [{ translateX }] }]}>
        {station.logoUrl ? (
          <Image source={{ uri: station.logoUrl }} style={styles.rowLogo} resizeMode="cover" />
        ) : (
          <View style={[styles.rowLogo, styles.rowLogoFallback]}>
            <Text style={styles.rowLogoFallbackText}>{station.name?.charAt(0)?.toUpperCase() ?? '🎵'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.rowInfo} onPress={() => playStation(station)} activeOpacity={0.7}>
          <Text style={[styles.rowName, isActive && styles.rowNameActive]} numberOfLines={1}>{station.name}</Text>
          {!!station.genre && <Text style={styles.rowGenre} numberOfLines={1}>{station.genre.split(',')[0].trim()}</Text>}
        </TouchableOpacity>
        {isActive && <Ionicons name="musical-notes" size={14} color="#646cff" style={{ marginRight: 8 }} />}
        <TouchableOpacity onPress={() => handleRemove(station)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={20} color="#f87171" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.rootContainer}>
      <Animated.View style={[styles.container, { opacity: masterFade }]}>
        
        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#646cff" />
              <Text style={styles.backText}>Biblioteca</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePlaylist}>
              <Ionicons name="ellipsis-vertical" size={20} color="#9399B2" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{playlist.name}</Text>
          <Text style={styles.subtitle}>{playlist.stations.length} emisora{playlist.stations.length !== 1 ? 's' : ''}</Text>
        </Animated.View>

        {/* Content */}
        {playlist.stations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color="#2D2D4A" />
            <Text style={styles.emptyTitle}>Lista vacía</Text>
            <Text style={styles.emptyText}>Aún no has añadido ninguna emisora.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddStations}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Añadir emisoras</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={playlist.stations}
            keyExtractor={item => item.id}
            renderItem={renderStation}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              <TouchableOpacity style={styles.addBtnOutline} onPress={handleAddStations}>
                <Ionicons name="add-circle-outline" size={18} color="#646cff" />
                <Text style={styles.addBtnOutlineText}>Añadir más emisoras</Text>
              </TouchableOpacity>
            }
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#0E0E1A' },
  container: { flex: 1, backgroundColor: '#0E0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#646cff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9399B2' },
  
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80, gap: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  emptyText: { fontSize: 14, color: '#9399B2', textAlign: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#646cff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 8, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  separator: { height: 1, backgroundColor: '#2D2D4A', marginLeft: 66 },
  addBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, marginTop: 10 },
  addBtnOutlineText: { color: '#646cff', fontSize: 14, fontWeight: '600' },
  
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowLogo: { width: 48, height: 48, borderRadius: 10, marginRight: 12, backgroundColor: '#16162A' },
  rowLogoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(100,108,255,0.18)' },
  rowLogoFallbackText: { fontSize: 20, fontWeight: '700', color: '#646cff' },
  rowInfo: { flex: 1, marginRight: 8 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 3 },
  rowNameActive: { color: '#646cff' },
  rowGenre: { fontSize: 12, color: '#9399B2' },
});
