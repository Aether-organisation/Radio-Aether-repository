import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const getStyles = (colors: any) => StyleSheet.create({
  banner: {
    height: 36,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
    zIndex: 100,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
  },
});

interface Props {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<Props> = ({ isOnline }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const slideAnim = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOnline ? -40 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [isOnline]);

  const handlePress = () => {
    Alert.alert(
      'Sin conexión',
      'No hay conexión a Internet. Se están mostrando los datos guardados localmente.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.inner} onPress={handlePress} activeOpacity={0.8}>
        <Ionicons name="wifi-outline" size={14} color="#f59e0b" />
        <Text style={styles.text}>Sin conexión · Mostrando datos guardados</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


