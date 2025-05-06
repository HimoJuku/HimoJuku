import React, { useContext,useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  Menu,
  Text,
  useTheme,
  Divider,
  List,
  Surface
} from 'react-native-paper';
import { ThemeContext, ThemePreference } from '@/constants/settings';
import { database } from '@/db';
import Settings from '@/db/models/settings';

const appData = require('@/app.json');
const SettingsScreen = () => {
  const { themePreference, setThemePreference } = useContext(ThemeContext);
  const { colors } = useTheme();
  const [themeMenuVisible, setThemeMenuVisible] = React.useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('中文');

  /**
   * Subscribe to settings changes
   */
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

  const themes = ['Light Mode', 'Dark Mode', 'Follow System'];
  const languages = ['中文', 'English'];

  /**
   * Get the theme preference value based on the label
   * @param label - The label of the theme
   * @returns {ThemePreference} - The theme preference value
   * @description This function returns the theme preference value based on the label.
   * @example getPreferenceValue('Light Mode')
   */
  const getPreferenceValue = (label: string): ThemePreference => {
    switch (label) {
      case 'Light Mode': return 'light';
      case 'Dark Mode': return 'dark';
      case 'Follow System': return 'system';
      default: return 'system';
    }
  };

  /**
   * Get the current theme label based on the theme preference
   * @returns {string} - The label of the current theme
   * @description This function returns the label of the current theme based on the theme preference.
   * @example getCurrentThemeLabel()
   */
  const getCurrentThemeLabel = (): string => {
    switch (themePreference) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'Follow System';
      default: return 'Follow System';
    }
  };

  /**
   * * Select a theme from the menu
   * @param themeLabel - The label of the selected theme
   * @description This function updates the theme preference in the context and saves it to the database.
   * It also closes the theme menu after selection.
   * @example selectTheme('Light Mode')
   */
  const selectTheme = (themeLabel: string) => {
    const newTheme = getPreferenceValue(themeLabel);
    setThemePreference(newTheme);
    // Save to database
    database.get<Settings>('settings').query().fetch()
      .then(results => {
        if (results.length > 0) {
          const settingsRecord = results[0];
          return database.write(async () => {
            await settingsRecord.update(setting => {
              setting.ThemePreference = newTheme;
            });
          });
        } else {
          // Create settings if none exist
          return database.write(async () => {
            await database.get<Settings>('settings').create(setting => {
              setting.ThemePreference = newTheme;
            });
          });
        }
      })
      .catch(error => console.error('Failed to save theme preference:', error));
    setThemeMenuVisible(false);
  }


  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    setLanguageMenuVisible(false);
  };



  return (
    <Surface style={[styles.container,{backgroundColor:colors.background}]}>
      <ScrollView  contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, styles.header]} variant="headlineMedium">
          Settings
        </Text>

        <Divider />

        <List.Section style={styles.listSection}>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description="Select app theme"
            right={() => (
              <Menu
                visible={themeMenuVisible}
                onDismiss={() => setThemeMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setThemeMenuVisible(true)}
                    textColor={colors.primary}>
                    {getCurrentThemeLabel()}
                  </Button>
                }
                anchorPosition='bottom'
                >
                {themes.map((theme) => (
                  <Menu.Item
                    key={theme}
                    onPress={() => selectTheme(theme)}
                    title={theme}
                  />
                ))}
              </Menu>
            )}
          />
        </List.Section>

        <Divider />

        <List.Section style={styles.listSection}>
          <List.Subheader>Language</List.Subheader>
          <List.Item
            title="App Language"
            description="Select display language"
            right={() => (
              <Menu
                visible={languageMenuVisible}
                onDismiss={() => setLanguageMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setLanguageMenuVisible(true)}
                    textColor={colors.primary}>
                    {selectedLanguage}
                  </Button>
                }
                anchorPosition='bottom'
                >
                {languages.map((language) => (
                  <Menu.Item
                    key={language}
                    onPress={() => selectLanguage(language)}
                    title={language}
                  />
                ))}
              </Menu>
            )}
          />
        </List.Section>

        <List.Section style={styles.versionContainer}>
          <Divider />
          <Text style={styles.versionText} variant="bodySmall">
            App Version: {appData.expo.version}
          </Text>
          <Text style={styles.versionText} variant="bodySmall">
            © 2025 Himojuku
          </Text>
        </List.Section>
      </ScrollView>

    </Surface>
  );
};
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  listSection: {
    marginVertical: 8,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop:'auto',
    marginBottom: 18,
  },
  versionText: {
  },
});

export default SettingsScreen;