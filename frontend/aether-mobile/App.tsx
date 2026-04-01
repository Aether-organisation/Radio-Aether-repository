import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { MiniPlayer } from './src/components/MiniPlayer';

import { ParamListBase } from '@react-navigation/native';
import { RootStackParamList, RootTabParamList } from './src/types/navigation';
import { AudioProvider } from './src/contexts/AudioContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#1E1E1E' },
          tabBarActiveTintColor: '#646cff',
          tabBarInactiveTintColor: '#888',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeScreen} 
          options={{ title: 'Home' }} 
        />
        <Tab.Screen 
          name="SearchTab" 
          component={SearchScreen} 
          options={{ title: 'Search' }} 
        />
        <Tab.Screen 
          name="LibraryTab" 
          component={LibraryScreen} 
          options={{ title: 'Library' }} 
        />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Player" component={PlayerScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}
