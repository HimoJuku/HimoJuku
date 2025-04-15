import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useNavigation } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ReaderProvider } from '@epubjs-react-native/core'; // epub阅读器
import { Colors } from '../constants/Colors';
import BookManagementScreen from './bookManagement/index';
import { database } from '../db';
import DatabaseTest from './DatabaseTest';

{/* 这仨暂时没用到，就注释掉了，stack导航换成用Drawer.Navigator的侧边栏导航和路由 */}
// import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Appbar,
  ThemeProvider,
} from 'react-native-paper';

// React Navigation - Drawer
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer';

type DrawerParamList = {
  "bookShlef": undefined;
  bookManagement: undefined;
  settings: undefined;
  reader: { path: string };
  databaseTest: undefined;
  // ...etc
};

import { lightColors, darkColors } from '../constants/Colors';

import {CustomDrawerContent} from '../components/CustomDrawerContent';
import ReaderPage from './(tabs)/reader';
import BookShelfScreen from './bookShelf';
SplashScreen.preventAutoHideAsync();

// 创建Drawer
const Drawer = createDrawerNavigator<DrawerParamList>();


function Header() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Appbar.Header>
      <Appbar.Action
       icon="menu"
       onPress={() => navigation.openDrawer()} 
       />
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
          initialRouteName="bookShlef"
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerActiveTintColor: Colors[colorScheme ?? 'light'].colors.tint,
            drawerStyle: {width: 240 },
            header: () => <Header />,
          }}
        >
          {/* 选项1：书架，对应 app/(tabs) 目录或文件 */}
          <Drawer.Screen
            name="bookShlef"
            options={{ title: '书架' }}
          >
            {() => <Slot />}
          </Drawer.Screen>
          
          {/* 选项2：书籍管理，对应 app/bookManagement/index.tsx*/}

          <Drawer.Screen
            name="bookManagement"
            options={{ title: '书籍管理' }}
            component={BookManagementScreen}
          />
          
          <Drawer.Screen
            name="reader"
            component={ReaderPage}
            options={{
              drawerLabel: () => null,  // 不显示
              title: '',
              drawerItemStyle: { height: 0 }, // 高度为 0
            }}
          />

          <Drawer.Screen
            name="databaseTest"
            options={{ title: '数据库测试' }}
            component={DatabaseTest}
          />


          {/* 选项3：设置，还没写*/}
          <Drawer.Screen
            name="settings"
            options={{ title: '设置' }}
          >
          
            {() => <Slot />}
          </Drawer.Screen>
        </Drawer.Navigator>
      </ReaderProvider>
    </PaperProvider>
  );
}
