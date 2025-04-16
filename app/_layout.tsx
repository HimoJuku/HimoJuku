import React from 'react';
import { useColorScheme } from 'react-native';
import { Dimensions } from 'react-native';

import { Slot, useNavigation } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen'; // Prevents the splash screen from auto-hiding
import 'react-native-reanimated';

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
import { Colors } from '@/constants/Colors';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { MaterialIcons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync(); // Prevents the splash screen from auto-hiding

type DrawerParamList = {
  picture: undefined; // Placeholder for the image background
  bookShelf: undefined;
  bookManagement: undefined;
  settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const colorScheme = useColorScheme();
const paperTheme =
  colorScheme === 'dark'
    ? { ...MD3DarkTheme, colors: Colors.dark.colors}
    : { ...MD3LightTheme, colors: Colors.light.colors };
const drawerWidth = //Calculate the width of the drawer based on the screen size
  (
    (Dimensions.get('window').width<Dimensions.get('window').height)
    ? Dimensions.get('window').width
    : Dimensions.get('window').height
  )* 8 / 18 + 20; // 这里调侧栏的大小

function TopBar() {
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

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <Drawer.Navigator
        initialRouteName="bookShelf"
        //Include the Image
        drawerContent={(props) => <CustomDrawerContent {...props} />}

        screenOptions={{
          drawerActiveTintColor: paperTheme.colors.onPrimary,
          drawerActiveBackgroundColor: paperTheme.colors.primary,
          drawerInactiveTintColor: paperTheme.colors.onSurfaceVariant,
          drawerStyle: {
            // Set the width of the drawer
            width: drawerWidth,
            marginHorizontal: 0,
            left: 0,
            marginLeft: 0,
            paddingStart: 0,
            paddingEnd: 0,
            backgroundColor: paperTheme.colors.primaryContainer,
          },
          drawerItemStyle: {
            left: 0,
            marginHorizontal: 0,
            marginLeft: 0,
            paddingStart: 0,
            paddingEnd: 0,
            width: '150%',
          },
          header: () => <TopBar />, //Override the header that could be turned off in the screen options
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
        >
          {() => <Slot />}
        </Drawer.Screen>

        {/* 书籍管理 */}
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

        {/* 设置 */}
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
    </PaperProvider>
  );
}