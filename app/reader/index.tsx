// app/reader/index.tsx

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
import {
  ReaderProvider,
  Reader,
  useReader,
} from '@himojuku/epubjs-react-native';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';

import Header from '@/app/reader/Header';
import Footer from '@/app/reader/Footer';
import TOC from '@/app/reader/TOC';           // ← 新增导入

export default function ReaderPage() {
  // 从路由读取 path 与 bookId
  const { path, bookId } = useLocalSearchParams<{
    path: string;
    bookId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI 状态
  const [headerFooterVisible, setHeaderFooterVisible] = useState(false);
  const [tocVisible, setTocVisible] = useState(false);         // ← TOC 可见性

  const { colors } = useTheme();
  const {
    currentLocation,
    totalLocations,
    goToLocation,                                           // ← 获取跳转函数
  } = useReader();

  /** 检查文件路径有效性 */
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
        if (!epubFile.exists || epubFile.size === 0) {
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

  /** 中央点击区域切换上下栏 */
  const toggleHeaderFooter = () =>
    setHeaderFooterVisible((v) => !v);

  /** 章节选择回调 */
  const handleSelectChapter = (href: string) => {
    console.log('[ReaderPage] jumping to:', href, 'goToLocation?', !!goToLocation);
    if (goToLocation) {
      goToLocation(href);
    }
    setTocVisible(false);
  };
  // ----------------- Loading / Error -----------------
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
        <Text style={{ color: 'red', fontWeight: 'bold' }}>❌ Load failed</Text>
        <Text style={{ marginTop: 10 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  // 当前页数
  const page = currentLocation?.start.location ?? 0;

  // ----------------- Main UI -----------------
  return (
    <ReaderProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          {/* EPUB 阅读器 */}
          <Reader src={validPath} fileSystem={useFileSystem} />

          {/* 左下角页码浮层 */}
          <View style={styles.progressOverlay}>
            <Text style={styles.progressText}>
              {`${page} / ${totalLocations}`}
            </Text>
          </View>

          {/* 中央点按区 */}
          <Pressable
            style={styles.centerTouchArea}
            onPress={toggleHeaderFooter}
          />

          {/* Header / Footer */}
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
                  onOpenTOC={() => setTocVisible(true)}          // ← 绑定按钮
                  onToggleFontPicker={() => {}}
                  onOpenAdvancedSettings={() => {}}
                  onToggleTheme={() => {}}
                />
              </View>
            </>
          )}

          {/* TOC 侧栏 */}
          <TOC
            bookId={bookId as string}                           // ← 传 bookId
            visible={tocVisible}
            onClose={() => setTocVisible(false)}
            onSelectChapter={handleSelectChapter}
          />
        </View>
      </SafeAreaView>
    </ReaderProvider>
  );
}

// ----------------- Styles -----------------
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
    color: '#000',
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
