import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const AiScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  useEffect(() => { navigation.navigate('MainTabs', { screen: 'HomeTab' }); }, []);
  return <View />;
};
