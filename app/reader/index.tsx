import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  ActivityIndicator,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { File } from 'expo-file-system/next';
import { ReaderProvider, Reader, useReader, Themes} from '@/epubjs-react-native/src';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import Header from '@/app/reader/Header';
import Footer from '@/app/reader/Footer';
import { typesettingDirections, readingDirections } from '@/constants/settings';

export default function ReaderPage() {
  const { path } = useLocalSearchParams<{ path: string }>();
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerFooterVisible, setHeaderFooterVisible] = useState(false);
  // Font picker state
  const [fontPickerVisible, setFontPickerVisible] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  // Settings state
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsTypesettingDirection, setSettingsTypesettingDirection] = useState(typesettingDirections.horizontal);
  const [settingsReadingDirection, setSettingsReadingDirection] = useState(readingDirections.ltr);
  const [flipSwipe, setFlipSwipe] = useState(false);

  const { colors } = useTheme();
  const { currentLocation, totalLocations } = useReader();
  const [currentTheme, setCurrentTheme] = useState(Themes.LIGHT);
  const [loadingTheme, setLoadingTheme] = useState(true);
  const toggleTheme = () => {
    setCurrentTheme(prev => 
      prev === Themes.DARK ? Themes.LIGHT : Themes.DARK
    );
  };

  // 检查并设置本地文件路径
  useEffect(() => {
    (async () => {
      if (!path) {
        setError('No local file path provided.');
        setLoading(false);
        return;
      }
      const localPath = decodeURIComponent(path);
      const epubFile = new File(localPath);
      try {
        if (!epubFile.exists|| epubFile.size == 0) {
          setError(`File not found or file size is 0: ${localPath}`);
        } else {
          setValidPath(localPath);
        }
      } catch (err: any) {
        setError(`File check error: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [path]);

  // Set the header/footer visibility
  const toggleHeaderFooter = () => {
    setHeaderFooterVisible(v => !v);
    // Hide settings and font picker when toggling header/footer
    if (headerFooterVisible) {
      setSettingsVisible(false);
    }
  };
  // Set the font picker visibility
  const onToggleFontPicker = () => {
    setFontPickerVisible(v => !v);
    setSettingsVisible(false);
  };
  // Set the settings visibility
  const toggleSettings = () => {
    setSettingsVisible(v => !v);
    setFontPickerVisible(false);
  };
  // TODO: Modify the font size
  const handleChangeFontSize = (size: number) => {
    setFontSize(size);
  };
  // TODO: Modify the line height
  const handleChangeLineHeight = (height: number) => {
    setLineHeight(height);
  };
  // TODO: Modify the typesetting direction
  const handleChangeTypesettingDirection = (direction: string) => {
    setSettingsTypesettingDirection(direction);
  };
  // Modify the reading direction
  const handleChangeReadingDirection = (direction: string) => {
    setFlipSwipe(direction === readingDirections.rtl);
    setSettingsReadingDirection(direction);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading...</Text>
      </SafeAreaView>
    );
  }
  if (error || !validPath) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Loading failed</Text>
        <Text style={{ marginTop: 10 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  const page = currentLocation?.start.location ?? 0;

  return (
    <ReaderProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          {/* EPUB 阅读器 */}
          <Reader 
          src={validPath} 
          fileSystem={useFileSystem} 
          enableFlipSwipe={flipSwipe}
          defaultTheme={currentTheme}
          />

          {/* Reading progress in the lower-left corner —— Black font, transparent background, closer to the lower-left corner */}
          <View style={styles.progressOverlay}>
            <Text style={styles.progressText}>
              {`${page} / ${totalLocations}`}
            </Text>
          </View>

          {/* Central clickable area to switch Header/Footer */}
          <Pressable
            style={styles.centerTouchArea}
            onPress={toggleHeaderFooter}
          />

          {/* Header & Footer */}
          {headerFooterVisible && (
            <>
              <View style={styles.header}>
                <Header
                  onOpenSearch={() => {}}
                  onOpenBookmarksList={() => {}}
                />
              </View>
              <View style={styles.footer}>
              <Footer
                  onOpenTOC={() => { } }
                  fontPickerVisible={fontPickerVisible}
                  onToggleFontPicker={onToggleFontPicker}
                  settingsVisible={settingsVisible}
                  fontSize={fontSize}
                  onChangeFontSize={handleChangeFontSize}
                  lineHeight={lineHeight}
                  onChangeLineHeight={handleChangeLineHeight}
                  onToggleTheme={toggleTheme}
                  onToggleSettings={toggleSettings}
                  onChangeTypesettingDirection={handleChangeTypesettingDirection}
                  typesettingDirections={settingsTypesettingDirection}
                  onChangeReadingDirection={handleChangeReadingDirection}
                  readingDirections={settingsReadingDirection}
                  />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ReaderProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  centerTouchArea: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '30%',
    bottom: '30%',
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 4,
  },
  settingContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 5,
  },
});