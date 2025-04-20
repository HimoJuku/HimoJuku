import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot, useNavigation } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen'; // Prevents the splash screen from auto-hiding
import 'react-native-reanimated';
import { ReaderProvider } from '@epubjs-react-native/core'; // epub阅读器
import { Colors } from '../constants/Colors';
import BookManagementScreen from './bookManagement/index';
import { database } from '../db';
import DatabaseTest from './DatabaseTest';
import BookshelfScreen from './bookShelf';

/* 4.18:merge后解决了一些导致冲突的代码，部分导入没用到，但考虑到后面可能要补充相关功能，所以没删，*/



import SettingsScreen from './settings/index';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Appbar,
  ThemeProvider,
} from 'react-native-paper';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { MaterialIcons } from '@expo/vector-icons';
import ReaderPage from './(tabs)/reader';

type DrawerParamList = {
  picture: undefined; // Placeholder for the image background
  "bookShelf": undefined;
  bookManagement: undefined;
  settings: undefined;
  reader: { path: string };
  databaseTest: undefined;
  // ...etc
};

SplashScreen.preventAutoHideAsync();

// Initialize the Drawer
const Drawer = createDrawerNavigator<DrawerParamList>();
// Initialize the ColorScheme
const colorScheme = useColorScheme();
const paperTheme =
  colorScheme === 'dark'
    ? { ...MD3DarkTheme, colors: Colors.dark.colors}
    : { ...MD3LightTheme, colors: Colors.light.colors };
//Calculate the width of the drawer based on the screen size
const drawerWidth =
  Dimensions.get('screen').width*0.55

function Header() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Appbar.Header mode='center-aligned'>
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
      <Appbar.Action icon= ""/>
      <Appbar.Content title="Himojuku"/>
      <Appbar.Action icon="magnify" onPress={() => {}} />
      <Appbar.Action icon="dots-vertical" onPress={() => {}} />
    </Appbar.Header>
  );
}


function LeftDrawer(){
  return (
  <Drawer.Navigator
    initialRouteName="bookShelf"
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      drawerActiveTintColor: paperTheme.colors.onPrimary,
      drawerActiveBackgroundColor: paperTheme.colors.primary,
      drawerInactiveTintColor: paperTheme.colors.onSurfaceVariant,
      drawerStyle: {
        // Set the width of the drawer
        width: drawerWidth,
        backgroundColor: paperTheme.colors.primaryContainer,
      },
      drawerItemStyle: {
        width: '100%',
        borderRadius: 80,
        paddingEnd: 10,
        paddingStart: 10,
      },
      header: () => <Header />, //Override the header that could be turned off in the screen options
    }}
  >
    {/* 选项1：书架，对应 app/(tabs) 目录或文件 */}
    <Drawer.Screen
      name="bookShelf"
      options={{
        title: 'Book Shelf',
        drawerIcon: ({color, size}) => (
          <MaterialIcons
              name= "book"
              size={size}
              color={color}
          />
        )
      }}
      component={BookshelfScreen}    
    />

    {/* 选项2：书籍管理，对应 app/bookManagement/index.tsx*/}
    <Drawer.Screen
      name="bookManagement"
      options={{
        title: 'Book Management',
        drawerIcon: ({color, size}) => (
          <MaterialIcons
              name= "library-add"
              size={size}
              color={color}
          />
        )
      }}
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

      
    {/* 选项?：测试按钮，用于各种测试，目前是会显示成功录入数据的书籍基础信息，对应 app/DatabaseTest/index.tsx*/}
    {/* 目前是会显示成功录入数据的书籍基础信息，对应 app/DatabaseTest/index.tming*/}
    <Drawer.Screen
      name="databaseTest"
      options={{ 
        title: 'For Testing',
        drawerIcon: ({color, size}) => (
          <MaterialIcons
              name= "bug-report"
              size={size}
              color={color}
          />
        )
      }}
      component={DatabaseTest}
    />

    {/* 选项3：设置，@ming已实现*/}
    <Drawer.Screen
      name="settings"
      options={{
        title: 'Setting',
        drawerIcon: ({color, size}) => (
          <MaterialIcons
              name= "settings"
              size={size}
              color={color}
          />
        )
      }}
      component={SettingsScreen}
    />
  </Drawer.Navigator>
  )
}

export default function RootLayout() {
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
        <LeftDrawer />
      </ReaderProvider>
    </PaperProvider>
  );
}