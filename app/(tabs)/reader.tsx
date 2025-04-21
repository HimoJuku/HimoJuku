import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Reader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';

export default function ReaderPage({ route }: { route?: any }) {
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkLocalFile() {
      try {
        const maybeLocalPath: string | undefined = route?.params?.path;

        if (!maybeLocalPath) {
          setError('未传入本地文件路径');
          setLoading(false);
          return;
        }

        console.log('[ReaderPage] 收到路径:', maybeLocalPath);

        const info = await FileSystem.getInfoAsync(maybeLocalPath);
        console.log('[ReaderPage] getInfoAsync 结果:', info);

        if (!info.exists || info.size === 0) {
          setError(`找不到文件或文件大小为 0:${maybeLocalPath}`);
          setLoading(false);
          return;
        }

        setValidPath(maybeLocalPath);
      } catch (err: any) {
        setError(`文件检查出错: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    checkLocalFile();
  }, [route]);

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
