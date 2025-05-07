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
import { Reader, useReader, Themes} from '@himojuku/epubjs-react-native';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';

import Header from '@/app/reader/Header';
import Footer from '@/app/reader/Footer';
import TOC from '@/app/reader/TOC';
import { readingDirections, Typesetting } from '@/constants/settings';


export default function ReaderPage() {
  const { path, bookId } = useLocalSearchParams<{ path: string; bookId: string }>();
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [headerFooterVisible, setHeaderFooterVisible] = useState(false);
  // Font picker state
  const [fontPickerVisible, setFontPickerVisible] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.5);
  // Settings state
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsTypesetting, setSettingsTypesetting] = useState<Typesetting>({
    writingMode: 'horizontal-tb',
    textOrientation: 'mixed'
  });
  const [settingsReadingDirection, setSettingsReadingDirection] = useState(readingDirections.ltr);
  const [flipSwipe, setFlipSwipe] = useState(false);

  const { colors } = useTheme();
  const { currentLocation, totalLocations, changeFontSize, changeTypesetting, goToLocation, changeTheme } = useReader();
  const page = currentLocation?.start.location ?? 0;
  const [tocVisible, setTocVisible] = useState(false);

  const [currentTheme, setCurrentTheme] = useState(Themes.LIGHT);
  const toggleTheme = () => {
    console.log('Toggle theme:', currentTheme === Themes.DARK ? 'Light' : 'Dark');
    // Toggle between light and dark themes
    setCurrentTheme(currentTheme === Themes.DARK ? Themes.LIGHT : Themes.DARK);
    changeTheme(currentTheme === Themes.DARK ? Themes.LIGHT : Themes.DARK);
  };
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
  }
  const showHeaderFooter = () => {
    setHeaderFooterVisible(true);
    setSettingsVisible(false);
  }
  const hideHeaderFooter = () => {
    setHeaderFooterVisible(false);
    setSettingsVisible(false);
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
  // Modify the font size
  const handleChangeFontSize = (delta: number) => {
    setFontSize(prev => {
      const newSize = Math.max(50, Math.min(200, prev + delta)); 
      console.log('Font size changed to:', newSize);
      changeFontSize(newSize+"%"); 
      return newSize;
    });
  };
  // TODO: Modify the line height
  const handleChangeLineHeight = (height: number) => {
    setLineHeight(height);
  };
  // TODO: Modify the typesetting direction
  const handleChangeTypesetting = (direction: Typesetting) => {
    setSettingsTypesetting(direction);
    changeTypesetting(direction);
  };
  // Modify the reading direction
  const handleChangeReadingDirection = (direction: string) => {
    setFlipSwipe(direction === readingDirections.rtl);
    setSettingsReadingDirection(direction);
  }
  const handleSelectChapter = (href: string) => {
    if (!goToLocation) {
      console.error('[ReaderPage] goToLocation 不可用');
      return;
    }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading…</Text>
      </SafeAreaView>
    );
  }
  if (error || !validPath) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}> Load failed</Text>
        <Text style={{ marginTop: 10 }}>{error}</Text>
      </SafeAreaView>
    );
  }
      const fileName = href.split('/').pop() || href;
      const noPrefix = href.replace(/^.*?(Text\/|chapter\/|OEBPS\/)/, '');
      const fileNameNoExt = fileName.split('.').slice(0, -1).join('.');

      console.log('→ M2 noPrefix 尝试跳转:', noPrefix);
      goToLocation(noPrefix);

      setTimeout(() => {
        console.log('→ M3 fileName 尝试跳转:', fileName);
        goToLocation(fileName);
      }, 100);

      setTimeout(() => {
        console.log('→ M4 fileNameNoExt 尝试跳转:', fileNameNoExt);
        goToLocation(fileNameNoExt);
      }, 200);

      setTocVisible(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1 }}>
            {/* EPUB Reader*/}
            <Reader
            src={validPath || ''}
            fileSystem={useFileSystem}
            enableFlipSwipe={flipSwipe}
            />

            {/* Reading progress in the lower-left corner —— Black font, transparent background, closer to the lower-left corner */}
            <View style={styles.progressOverlay}>
              <Text style={styles.progressText}>
                {`${page} / ${totalLocations}`}
              </Text>
            </View>
  
              {/* Touch area to toggle header/footer */}
          <Pressable
            style={styles.centerTouchArea}
            onPress={toggleHeaderFooter}
            //onLongPress={showHeaderFooter}
            delayLongPress={500} // 500ms long press to show header/footer
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
                    onOpenTOC={() => setTocVisible(true) }
                    fontPickerVisible={fontPickerVisible}
                    onToggleFontPicker={onToggleFontPicker}
                    fontSize={fontSize}
                    onChangeFontSize={handleChangeFontSize}
                    lineHeight={lineHeight}
                    onChangeLineHeight={handleChangeLineHeight}
                    onToggleTheme={toggleTheme}
                    settingsVisible={settingsVisible}
                    onToggleSettings={toggleSettings}
                    onChangeTypesetting={handleChangeTypesetting}
                    typesetting={settingsTypesetting}
                    onChangeReadingDirection={handleChangeReadingDirection}
                    readingDirections={settingsReadingDirection}
                    />
                </View>
              </>
            )}
            <TOC
              bookId={bookId}
              visible={tocVisible}
              onClose={() => setTocVisible(false)}
              onSelectChapter={handleSelectChapter}
            />
          </View>
        </SafeAreaView>
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
    left: '30%',
    right: '30%',
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
