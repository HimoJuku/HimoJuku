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
import { ReaderProvider, Reader, useReader, Themes} from '@himojuku/epubjs-react-native/';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import Header from '@/app/reader/Header';
import Footer from '@/app/reader/Footer';

export default function ReaderPage() {
  const { path } = useLocalSearchParams<{ path: string }>();
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerFooterVisible, setHeaderFooterVisible] = useState(false);

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
        setError('未传入本地文件路径');
        setLoading(false);
        return;
      }
      const localPath = decodeURIComponent(path);
      const epubFile = new File(localPath);
      try {
        if (!epubFile.exists|| epubFile.size == 0) {
          setError(`找不到文件或文件大小为 0: ${localPath}`);
        } else {
          setValidPath(localPath);
        }
      } catch (err: any) {
        setError(`文件检查出错: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [path]);

  // 切换 Header/Footer 显示
  const toggleHeaderFooter = () => {
    setHeaderFooterVisible(v => !v);
  };

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
          defaultTheme={currentTheme}
          />

          {/* 左下角阅读进度 —— 黑色字体，透明背景，更贴近左下角 */}
          <View style={styles.progressOverlay}>
            <Text style={styles.progressText}>
              {`${page} / ${totalLocations}`}
            </Text>
          </View>

          {/* 中央可点击区域，切换 Header/Footer */}
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
                  onOpenTOC={() => {}}
                  onToggleFontPicker={() => {}}
                  onOpenAdvancedSettings={() => {}}
                  onToggleTheme={toggleTheme}
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
});