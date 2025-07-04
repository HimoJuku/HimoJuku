import React, {useEffect} from 'react';
import {
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '../constants/colors';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider
} from 'react-native-paper';

import { ThemeContext, ThemePreference, ResolvedThemeType  } from '../constants/settings';

import { Stack } from 'expo-router';
import { SearchBar } from '@/components/Header';
import { ReaderProvider } from '@himojuku/epubjs-react-native';
import { database } from '@/db';
import Settings from '@/db/models/settings';
/**
 * Root layout component for the app.
 * This component sets up the theme context and the drawer navigator.
 * It also provides a header and a custom drawer content component.
 */
export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = React.useState<ThemePreference>("system");
  // Get the system color scheme (light or dark) from the device settings
  const safeSystemTheme = systemColorScheme || "light";
  const resolvedTheme: ResolvedThemeType =
    themePreference === "system" ? safeSystemTheme : themePreference;
  // Determine the resolved theme based on the user's preference and system settings
  const paperTheme = resolvedTheme === 'dark'
      ? { ...MD3DarkTheme, colors: Colors.dark.colors }
      : { ...MD3LightTheme, colors: Colors.light.colors };

  useEffect(() => {
    const sub = database.get<Settings>('settings').query().observe().subscribe((settings) => {
      settings.forEach((setting) => {
        const themePreference = setting.ThemePreference as ThemePreference;
        // Update the theme preference in the context
        setThemePreference(themePreference);
      });
    });
    return () => sub.unsubscribe();
  }, [setThemePreference]); // Add dependency

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
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              initialRouteName="(drawer)"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
                presentation: 'modal',
              }}
              >
              <Stack.Screen
                name="reader/index"
                options={{
                  title: "Reader",
                  animation: 'fade',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="search"
                options={{
                  title: "Search",
                  animation: 'fade',
                  presentation: 'modal',
                  headerShown: true,
                  header: () => <SearchBar/>,
                }}
              />
              <Stack.Screen
                name="(drawer)"
                options={{
                  animation: 'fade',
                  presentation: 'modal'
                }}
              />
            </Stack>
          </GestureHandlerRootView>
        </ReaderProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}
