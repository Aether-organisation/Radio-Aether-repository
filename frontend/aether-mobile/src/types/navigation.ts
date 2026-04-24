import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Survey: undefined;
  Player: undefined;
  MainTabs: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  LibraryTab: undefined;
  ProfileTab: undefined;
  NowPlayingTab: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'HomeTab'>;

