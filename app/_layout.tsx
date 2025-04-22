import React from 'react';
import {
  useColorScheme,
  Dimensions
} from 'react-native';
import { useNavigation } from 'expo-router';
import 'react-native-reanimated';
import { ReaderProvider } from '@epubjs-react-native/core';
import { Colors } from '@/constants/colors';
import BookManagementScreen from '@/app/bookManagement/index';
import DatabaseTest from '@/app/DatabaseTest/index';
import BookshelfScreen from '@/app/bookShelf/index';
import SettingsScreen from '@/app/settings/index';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Appbar,
  useTheme,
} from 'react-native-paper';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { MaterialIcons } from '@expo/vector-icons';
import ReaderPage from '@/app/(tabs)/Reader';
import { ThemeContext, ThemePreference, ResolvedThemeType  } from '../constants/settings';


/// Define the type for the drawer navigator's parameter list
type DrawerParamList = {
  picture: undefined;
  "bookShelf": undefined;
  bookManagement: undefined;
  settings: undefined;
  reader: { path: string };
  databaseTest: undefined;
};

// Create the drawer navigator
const Drawer = createDrawerNavigator<DrawerParamList>();
const drawerWidth =
  Dimensions.get('screen').width*0.58;
/**
 * Header component for the drawer navigator.
 */
function Header() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  return (
    <Appbar.Header mode='center-aligned'>
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
      <Appbar.Action icon= ""/>
      <Appbar.Content title="Himojuku" color={theme.colors.primary}/>
      <Appbar.Action icon="magnify" onPress={() => {}} />
      <Appbar.Action icon="dots-vertical" onPress={() => {}} />
    </Appbar.Header>
  );
}
/**
 * Root layout component for the app.
 * This component sets up the theme context and the drawer navigator.
 * It also provides a header and a custom drawer content component.
 */
export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  // Get the system color scheme (light or dark) from the device settings
  const [themePreference, setThemePreference] =
    React.useState<ThemePreference>("system");

  const safeSystemTheme = systemColorScheme || "light";
  const resolvedTheme: ResolvedThemeType =
    themePreference === "system" ? safeSystemTheme : themePreference;
  // Determine the resolved theme based on the user's preference and system settings
  const paperTheme = resolvedTheme === 'dark'
      ? { ...MD3DarkTheme, colors: Colors.dark.colors }
      : { ...MD3LightTheme, colors: Colors.light.colors };
  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        resolvedTheme,
        setThemePreference,
      }}
    >
      <PaperProvider theme={paperTheme}>
        <ReaderProvider>
          {/* Set up the drawer navigator with custom options and screens */}
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
                width: drawerWidth-10,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 80,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 80,
              },
              header: () => <Header />,
            }}
          >
            {/* Define the screens for the drawer navigator */}
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
                // Hide the drawer item for the reader screen
                drawerLabel: () => null,
                title: '',
                // Hide the drawer icon for the reader screen
                drawerItemStyle: { height: 0 }
              }}
            />
            {/* Add a test screen for database testing */}
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
        </ReaderProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}