import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Menu, Divider, PaperProvider, Text } from 'react-native-paper';
import Constants from 'expo-constants';

const SettingsScreen = () => {
  const [themeMenuVisible, setThemeMenuVisible] = React.useState(false);
  const [selectedTheme, setSelectedTheme] = React.useState('Light Mode');
  const [languageMenuVisible, setLanguageMenuVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('中文');

  // 主题选项
  const themes = ['Light Mode', 'Dark Mode'];

  // 语言选项
  const languages = ['中文', 'English'];

  // 打开主题菜单
  const openThemeMenu = () => setThemeMenuVisible(true);
  const closeThemeMenu = () => setThemeMenuVisible(false);

  // 选择主题
  const selectTheme = (theme: string) => {
    setSelectedTheme(theme);
    closeThemeMenu();
    // TODO: 实际主题切换逻辑需要结合全局状态管理
  };

  // 选择语言
  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    setLanguageMenuVisible(false);
  };

  return (
    <PaperProvider>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent} // 新增内容容器样式
      >
        <Text style={styles.title}>settings</Text>

        {/* 主题设置 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark mode setting</Text>
          <Menu
            visible={themeMenuVisible}
            onDismiss={closeThemeMenu}
            anchor={
              <Button 
                onPress={openThemeMenu} 
                mode="outlined"
                style={styles.squareButton} 
                labelStyle={styles.buttonLabel}
              >
                {selectedTheme}
              </Button>
            }
          >
            {themes.map((theme, index) => (
              <Menu.Item
                key={`theme-${index}`}
                onPress={() => selectTheme(theme)}
                title={theme}
              />
            ))}
          </Menu>
        </View>

        {/* 语言设置 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>System Language</Text>
          <Menu
            visible={languageMenuVisible}
            onDismiss={() => setLanguageMenuVisible(false)}
            anchor={
              <Button 
                onPress={() => setLanguageMenuVisible(true)} 
                mode="outlined"
                style={styles.squareButton}
                labelStyle={styles.buttonLabel}
              >
                {selectedLanguage}
              </Button>
            }
          >
            {languages.map((language, index) => (
              <Menu.Item
                key={`lang-${index}`}
                onPress={() => selectLanguage(language)}
                title={language}
              />
            ))}
          </Menu>
        </View>

        {/* 新增弹性占位空间 */}
        <View style={styles.spacer} />

        {/* 版本信息 - 移动到底部 */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>About Himojuku</Text>
          <Text style={styles.buildText}>Est. 2025</Text>
        </View>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollContent: {  //内容容器样式
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginRight: 16,
  },
  //按钮样式
  squareButton: {
    borderRadius: 10,       
    borderWidth: 1.5,
    borderColor: '#666',
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#333',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
    minHeight: 32,  //最小间距
  },
  versionContainer: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,   //分割线
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  buildText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
});

export default SettingsScreen;