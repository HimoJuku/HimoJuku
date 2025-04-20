import React, { useContext } from 'react';
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
import { ThemeContext, ThemePreference } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { themePreference, setThemePreference } = useContext(ThemeContext);
  const { colors } = useTheme();
  const [themeMenuVisible, setThemeMenuVisible] = React.useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('中文');

  // 主题选项处理
  const themes = ['Light Mode', 'Dark Mode', 'Follow System'];
  const languages = ['中文', 'English'];
  const THEME_OPTIONS = [
    { label: 'Light Mode', value: 'light' },
    { label: 'Dark Mode', value: 'dark' },
    { label: 'Follow System', value: 'system' },
  ] as const;
  const getPreferenceValue = (label: string): ThemePreference => {
    switch (label) {
      case 'Light Mode': return 'light';
      case 'Dark Mode': return 'dark';
      case 'Follow System': return 'system';
      default: return 'system';
    }
  };

  const getCurrentThemeLabel = (): string => {
    switch (themePreference) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'Follow System';
      default: return 'Follow System';
    }
  };

  const selectTheme = (themeLabel: string) => {
    setThemePreference(getPreferenceValue(themeLabel));
    setThemeMenuVisible(false);
  };

  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    setLanguageMenuVisible(false);
  };



  return (
    <Surface style={[styles.container,{backgroundColor:colors.background}]}>
      <ScrollView  contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <Text style={[styles.title, styles.header]} variant="headlineMedium">
          Settings
        </Text>

        <Divider />

        {/* 主题设置 */}
        <List.Section style={styles.listSection}>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description="Select app theme"
            right={({ color }) => (
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
                }>
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

        {/* 语言设置 */}
        <List.Section style={styles.listSection}>
          <List.Subheader>Language</List.Subheader>
          <List.Item
            title="App Language"
            description="Select display language"
            right={({ color }) => (
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
                }>
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

        {/* 版本信息 */}
        <List.Section style={styles.versionContainer}>
          <Divider />
          <Text style={styles.versionText} variant="bodySmall">
            App Version: 1.0.0
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