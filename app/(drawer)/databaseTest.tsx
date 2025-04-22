import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '@/db';
import Settings from '@/db/models/settings';
import { Button } from 'react-native-paper';
import { ThemePreference } from '@/constants/settings';

export default function SettingsDatabaseTest() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 从数据库获取设置
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsRecords = await database.collections.get<Settings>('settings').query().fetch();
      console.log('获取到的设置:', settingsRecords);
      setSettings(settingsRecords.length > 0 ? settingsRecords[0] : null);
    } catch (err: any) {
      setError(err.message || String(err));
      console.error('设置数据库测试错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建默认设置
  const createDefaultSettings = async () => {
    try {
      setLoading(true);
      await database.write(async () => {
        const settingsCollection = database.collections.get<Settings>('settings');
        const newSettings = await settingsCollection.create(settings => {
          settings.ThemePreference = 'system';
        });
        setSettings(newSettings);
      });
      console.log('创建默认设置成功');
    } catch (err: any) {
      setError(err.message || String(err));
      console.error('创建设置错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 更新主题偏好
  const updateThemePreference = async (newTheme: ThemePreference) => {
    if (!settings) return;
    
    try {
      setLoading(true);
      await database.write(async () => {
        await settings.update(record => {
          record.ThemePreference = newTheme;
        });
      });
      console.log('主题偏好更新为:', newTheme);
      await fetchSettings(); // 更新后刷新数据
    } catch (err: any) {
      setError(err.message || String(err));
      console.error('更新主题偏好错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 页面聚焦时加载数据
  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>正在加载设置数据...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>设置数据库测试出错: {error}</Text>
        <Button mode="contained" onPress={fetchSettings} style={styles.button}>
          重试
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>设置数据库测试</Text>
      
      {!settings ? (
        <View>
          <Text style={styles.emptyText}>未找到设置记录</Text>
          <Button mode="contained" onPress={createDefaultSettings} style={styles.button}>
            创建默认设置
          </Button>
        </View>
      ) : (
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsItem}>
            当前主题设置: <Text style={styles.valueText}>{settings.ThemePreference}</Text>
          </Text>
          
          <Text style={styles.sectionTitle}>更新主题设置:</Text>
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => updateThemePreference('light')}
              style={[styles.themeButton, settings.ThemePreference === 'light' && styles.activeButton]}
            >
              浅色模式
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => updateThemePreference('dark')}
              style={[styles.themeButton, settings.ThemePreference === 'dark' && styles.activeButton]}
            >
              深色模式
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => updateThemePreference('system')}
              style={[styles.themeButton, settings.ThemePreference === 'system' && styles.activeButton]}
            >
              跟随系统
            </Button>
          </View>
          
          <Button 
            mode="contained" 
            onPress={fetchSettings}
            style={styles.refreshButton}
          >
            刷新设置
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    marginTop: 8,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  settingsContainer: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  settingsItem: {
    fontSize: 16,
    marginBottom: 16,
  },
  valueText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  themeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
  },
  button: {
    marginTop: 8,
  },
  refreshButton: {
    marginTop: 16,
  }
});
