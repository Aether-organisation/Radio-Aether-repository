import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, TextInput, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RadioStation } from '../types';
import { usePlaylists } from '../contexts/PlaylistsContext';
import { Radius, Shadows } from '../theme/theme';
import { useTheme } from '../contexts/ThemeContext';

const getStyles = (colors: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    ...Shadows.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: colors.surfaceBorder,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stationName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 8,
  },
  list: {
    maxHeight: 240,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  createInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  createBtn: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: colors.cyan,
  },
  createBtnDisabled: {
    opacity: 0.35,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.void,
  },
  confirmedWrap: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  confirmedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

interface PlaylistPickerModalProps {
  visible: boolean;
  station: RadioStation | null;
  onClose: () => void;
}

export const PlaylistPickerModal: React.FC<PlaylistPickerModalProps> = ({
  visible,
  station,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { playlists, createPlaylist, addStationToPlaylist } = usePlaylists();

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [inputValue, setInputValue]           = useState('');
  const [loading, setLoading]                 = useState(false);
  const [confirmed, setConfirmed]             = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setShowCreateInput(false);
      setInputValue('');
      setConfirmed(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleConfirmed = () => {
    setConfirmed(true);
    setTimeout(() => handleClose(), 1200);
  };

  const handleAddToExisting = async (playlistId: string) => {
    if (!station || loading) return;
    setLoading(true);
    try {
      await addStationToPlaylist(playlistId, station);
      handleConfirmed();
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!station || !inputValue.trim() || loading) return;
    setLoading(true);
    try {
      const newPlaylist = await createPlaylist(inputValue.trim());
      await addStationToPlaylist(newPlaylist.id, station);
      handleConfirmed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {confirmed ? (
          <View style={styles.confirmedWrap}>
            <Ionicons name="checkmark-circle" size={32} color={colors.cyan} />
            <Text style={styles.confirmedText}>Añadida a la lista</Text>
          </View>
        ) : (
          <>
            {/* Title */}
            <Text style={styles.title}>Añadir a lista</Text>
            {station && (
              <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
            )}

            <View style={styles.separator} />

            {/* Existing playlists */}
            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {playlists.map(playlist => {
                const alreadyIn = station
                  ? playlist.stations.some(s => s.stationId === station.id)
                  : false;

                return (
                  <TouchableOpacity
                    key={playlist.id}
                    style={styles.row}
                    onPress={() => !alreadyIn && handleAddToExisting(playlist.id)}
                    activeOpacity={alreadyIn ? 1 : 0.7}
                    disabled={alreadyIn || loading}
                  >
                    <Ionicons name="list" size={20} color={colors.cyan} style={styles.rowIcon} />
                    <Text style={styles.rowText} numberOfLines={1}>{playlist.name}</Text>
                    {alreadyIn && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.cyan} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.separator} />

            {/* New playlist */}
            {showCreateInput ? (
              <View style={styles.row}>
                <Ionicons name="add-circle-outline" size={20} color={colors.cyan} style={styles.rowIcon} />
                <TextInput
                  style={styles.createInput}
                  placeholder="Nombre de la lista..."
                  placeholderTextColor={colors.textTertiary}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={!inputValue.trim() || loading}
                  style={[styles.createBtn, !inputValue.trim() && styles.createBtnDisabled]}
                >
                  <Text style={styles.createBtnText}>Crear</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.row}
                onPress={() => setShowCreateInput(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.cyan} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: colors.cyan }]}>Nueva lista</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>
    </Modal>
  );
};


