// app/reader.tsx

import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Reader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useLocalSearchParams } from 'expo-router';

export default function ReaderPage() {
  const { path } = useLocalSearchParams<{ path: string }>();
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkLocalFile() {
      try {
        if (!path) {
          setError('未传入本地文件路径');
          return;
        }
        // 如果参数被 URL-encode 过，需要 decode
        const localPath = decodeURIComponent(path);

        console.log('[ReaderPage] 收到路径:', localPath);

        const info = await FileSystem.getInfoAsync(localPath);
        console.log('[ReaderPage] getInfoAsync 结果:', info);

        if (!info.exists || info.size === 0) {
          setError(`找不到文件或文件大小为 0: ${localPath}`);
          return;
        }

        setValidPath(localPath);
      } catch (err: any) {
        setError(`文件检查出错: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    checkLocalFile();
  }, [path]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>正在加载本地文件...</Text>
      </SafeAreaView>
    );
  }

  if (error || !validPath) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>❌ 加载失败</Text>
        <Text style={{ marginTop: 10 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Reader
        src={validPath}
        fileSystem={useFileSystem}
      />
    </SafeAreaView>
  );
}
