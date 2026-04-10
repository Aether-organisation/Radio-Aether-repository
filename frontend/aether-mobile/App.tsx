import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { LoginScreen }   from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { PlayerScreen }  from './src/screens/PlayerScreen';
import { HomeScreen }    from './src/screens/HomeScreen';
import { SearchScreen }  from './src/screens/SearchScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SurveyScreen }  from './src/screens/SurveyScreen';
import { MiniPlayer }    from './src/components/MiniPlayer';

import { RootStackParamList, RootTabParamList } from './src/types/navigation';
import { AudioProvider }     from './src/contexts/AudioContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#16162A',
            borderTopColor: '#2D2D4A',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#646cff',
          tabBarInactiveTintColor: '#9399B2',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
              HomeTab:       { active: 'home',           inactive: 'home-outline'          },
              SearchTab:     { active: 'search',         inactive: 'search-outline'         },
              LibraryTab:    { active: 'heart',          inactive: 'heart-outline'          },
              ProfileTab:    { active: 'person',         inactive: 'person-outline'         },
              NowPlayingTab: { active: 'musical-notes',  inactive: 'musical-notes-outline'  },
            };
            const { active, inactive } = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
            return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab"       component={HomeScreen}   options={{ title: 'Inicio'      }} />
        <Tab.Screen name="SearchTab"     component={SearchScreen} options={{ title: 'Buscar'      }} />
        <Tab.Screen name="LibraryTab"    component={LibraryScreen} options={{ title: 'Biblioteca' }} />
        <Tab.Screen name="NowPlayingTab" component={PlayerScreen} options={{ title: 'Reproduciendo' }} />
        <Tab.Screen name="ProfileTab"    component={ProfileScreen} options={{ title: 'Perfil'     }} />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login"    component={LoginScreen}    />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Survey"   component={SurveyScreen}   />
            <Stack.Screen name="Player"   component={PlayerScreen}   />
            <Stack.Screen name="MainTabs" component={MainTabs}       />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </AudioProvider>
  );
}
