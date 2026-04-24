import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/theme/theme';

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
import { PlaylistsProvider } from './src/contexts/PlaylistsContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.void }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.surfaceBorder,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarActiveTintColor: Colors.cyan,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },
          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === 'AiTab') {
              return <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={size} color={focused ? Colors.aiPurple : Colors.textSecondary} />;
            }
            const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
              HomeTab:       { active: 'home',           inactive: 'home-outline'          },
              SearchTab:     { active: 'search',         inactive: 'search-outline'        },
              LibraryTab:    { active: 'heart',          inactive: 'heart-outline'         },
              ProfileTab:    { active: 'person',         inactive: 'person-outline'        },
              NowPlayingTab: { active: 'musical-notes',  inactive: 'musical-notes-outline' },
            };
            const { active, inactive } = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
            return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab"       component={HomeScreen}    options={{ title: 'Ondas'    }} />
        <Tab.Screen name="SearchTab"     component={SearchScreen}  options={{ title: 'Buscar'   }} />
        <Tab.Screen name="LibraryTab"    component={LibraryScreen} options={{ title: 'Guardadas' }} />
        <Tab.Screen name="NowPlayingTab" component={PlayerScreen}  options={{ title: 'Sonando'  }} />
        <Tab.Screen name="ProfileTab"    component={ProfileScreen} options={{ title: 'Yo'       }} />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <FavoritesProvider>
        <PlaylistsProvider>
          <View style={{ flex: 1, backgroundColor: Colors.void }}>
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
          </View>
        </PlaylistsProvider>
      </FavoritesProvider>
    </AudioProvider>
  );
}
