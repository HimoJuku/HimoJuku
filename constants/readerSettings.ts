// constants/readerSettings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReaderTheme = 'light' | 'dark' | 'sepia';
export type ReaderSettings = {
  theme: ReaderTheme;
  fontSize: number;
};

const SETTINGS_STORAGE_KEY = 'reader_settings';

// Default settings for the reader
const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light', 
  fontSize: 16,
};

export const loadReaderSettings = async (): Promise<ReaderSettings> => {
  try {
    const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveReaderSettings = async (settings: ReaderSettings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};