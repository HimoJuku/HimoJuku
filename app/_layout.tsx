import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useNavigation } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ReaderProvider } from '@epubjs-react-native/core'; // epub阅读器

import BookManagementScreen from './bookManagement/index';
import SettingsScreen from './settings/index';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Appbar,
} from 'react-native-paper';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { lightColors, darkColors } from '../constants/Colors';
import { CustomDrawerContent } from '../components/CustomDrawerContent';

SplashScreen.preventAutoHideAsync();

type DrawerParamList = {
  bookShelf: undefined; 
  bookManagement: undefined;
  settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function Header() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
      <Appbar.Content title="BookShelf" />
      <Appbar.Action icon="magnify" onPress={() => {}} />
      <Appbar.Action icon="dots-vertical" onPress={() => {}} />
    </Appbar.Header>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, colors: darkColors.colors }
      : { ...MD3LightTheme, colors: lightColors.colors };

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ReaderProvider>
        <Drawer.Navigator
          initialRouteName="bookShelf"
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: {
              width: 240, // 这里调侧栏的大小
            },
            header: () => <Header />,
          }}
        >
          {/* 选项1：书架，对应 app/(tabs) 目录或文件 */}
          <Drawer.Screen
            name="bookShelf"
            options={{ title: '书架' }}
          >
            {() => <Slot />}
          </Drawer.Screen>

        {/* 书籍管理 */}
        <Drawer.Screen
          name="bookManagement"
          options={{ title: '书籍管理' }}
          component={BookManagementScreen}
        />

        {/* 设置 */}
        <Drawer.Screen
          name="settings"
          options={{ title: '设置' }}
          component={SettingsScreen}
        />
      </Drawer.Navigator>
      </ReaderProvider>
    </PaperProvider>
  );
}