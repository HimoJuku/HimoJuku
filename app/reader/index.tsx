// app/reader/index.tsx
//
// 功能：EPUB 阅读器页面
// - 接收路由参数 path 和 bookId
// - 验证本地 EPUB 文件是否有效
// - 渲染 epubjs-react-native 阅读器
// - 支持目录（TOC）侧栏与章节跳转
// - 支持顶部 Header 和底部 Footer 控件切换

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
import TOC from '@/app/reader/TOC';

export default function ReaderPage() {
  const { path, bookId } = useLocalSearchParams<{ path: string; bookId: string }>();
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <ReaderProvider>
      <ReaderContent validPath={validPath} bookId={bookId as string} />
    </ReaderProvider>
  );
}

function ReaderContent({ validPath, bookId }: { validPath: string; bookId: string }) {
  const { colors } = useTheme();
  const [headerFooterVisible, setHeaderFooterVisible] = useState(false);
  const [tocVisible, setTocVisible] = useState(false);

  const {
    currentLocation,
    totalLocations,
    goToLocation,
  } = useReader();

  const page = currentLocation?.start.location ?? 0;

  const toggleHeaderFooter = () => setHeaderFooterVisible(v => !v);

  const handleSelectChapter = (href: string) => {
    if (!goToLocation) {
      console.error('[ReaderPage] goToLocation 函数不可用!');
      return;
    }

    try {
      const fileName = href.split('/').pop() || href;
      console.log('[ReaderPage] 使用文件名跳转:', fileName);
      goToLocation(fileName);
      setTocVisible(false);
    } catch (err: any) {
      console.error('[ReaderPage] 跳转失败:', err.message || err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <Reader src={validPath} fileSystem={useFileSystem} />

        <View style={styles.progressOverlay}>
          <Text style={styles.progressText}>{`${page} / ${totalLocations}`}</Text>
        </View>

        <Pressable style={styles.centerTouchArea} onPress={toggleHeaderFooter} />

        {headerFooterVisible && (
          <>
            <View style={styles.header}>
              <Header onOpenSearch={() => {}} onOpenBookmarksList={() => {}} />
            </View>
            <View style={styles.footer}>
              <Footer
                onOpenTOC={() => setTocVisible(true)}
                onToggleFontPicker={() => {}}
                onOpenAdvancedSettings={() => {}}
                onToggleTheme={() => {}}
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
