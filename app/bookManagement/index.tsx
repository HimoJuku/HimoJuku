import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme, Button as PaperButton } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Book } from '../book/type';
import ePub from 'epubjs';

async function parseEpubMeta(epubPath: string): Promise<{
  title?: string;
  author?: string;
  coverUri?: string;
}> {
  try {
    // 用 ePubjs 加载本地 epub
    const book = ePub(epubPath);

    // 打开 epub
    await book.opened; 
    // 获取 metadata: 包含 title, creator(作者) 等
    const metadata = await book.loaded.metadata;
    const { title, creator } = metadata;

    // 获取封面 ID
    const coverId = await book.loaded.cover;
    let coverUri: string | undefined;

    // 如果有封面 ID，就提取封面 Blob 并写入本地
    if (coverId) {
      const blob = await book.archive.getBlob(coverId);
      // 转成 base64
      const base64Data = await convertBlobToBase64(blob);
      // 写到 app 专用目录
      const coverPath = FileSystem.documentDirectory + `covers/${Date.now()}.jpg`;
      // base64 写入文件
      await FileSystem.writeAsStringAsync(coverPath, base64Data, { encoding: 'base64' });
      coverUri = coverPath; // 赋给 coverUri
    }

    return {
      title,
      author: creator,
      coverUri,
    };
  } catch (err) {
    console.error('解析 epub 出错:', err);
    return {};
  }
}

// 2) 一个辅助把 Blob -> Base64
function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // dataUrl 类似 "data:application/octet-stream;base64,AAAA..."
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function BookManagementScreen() {
  const [books, setBooks] = useState<{ name: string; uri: string }[]>([]);
  // 获取主题对象
  const theme = useTheme();
  const colorScheme = useColorScheme(); 
  const tint = Colors[colorScheme ?? 'light'].colors.tint; 
  type DrawerParamList = {
    bookShlef: undefined;
    bookManagement: undefined;
    settings: undefined;
    reader: { path: string };
  };
  
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  // ============ 原有的导入逻辑保留 ============
  const handleImportBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const { name, uri } = file;
        const booksDir = FileSystem.documentDirectory + 'books/';
        const localPath = booksDir + name;
        // 确保目录存在
        const dirInfo = await FileSystem.getInfoAsync(booksDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
        }
        // 执行复制
        await FileSystem.copyAsync({ from: uri, to: localPath });
        console.log('已复制:', localPath);
        // 更新 state
        setBooks((prev) => [...prev, { name, uri: localPath }]);
      } else {
        console.log('未选择任何文件');
      }
    } catch (err) {
      console.error('导入文件出错:', err);
    }
  };

  const handleOpenReader = (path: string) => {
    navigation.navigate('reader', { path });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, theme.fonts.titleLarge]}> 
        书籍管理
      </Text>

      {/* 使用Paper Button +主色调 */}
      <PaperButton
        mode="contained"
        onPress={handleImportBook}
        buttonColor={tint}
        style={{ marginBottom: 16 }}
      >
        导入书籍
      </PaperButton>

      <View style={styles.bookList}>
        {books.length === 0 ? (
          <Text style={{ color: theme.colors.onBackground }}>暂无书籍</Text>
        ) : (
          books.map((book, index) => (
            <View key={index} style={styles.bookItem}>
              <Text style={[styles.bookName, { color: theme.colors.onBackground }]}>
                {book.name}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{book.uri}</Text>

              {/* 二次按钮：阅读此书 */}
              <PaperButton
                mode="contained"
                onPress={() => handleOpenReader(book.uri)}
                buttonColor={tint}
                style={{ marginTop: 8 }}
              >
                阅读此书
              </PaperButton>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  bookList: {
    marginTop: 12,
  },
  bookItem: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  bookName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});
