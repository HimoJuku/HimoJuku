import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme, Button as PaperButton } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


import { parseAndSaveEpub } from './epubParser'; 

/**
 * BookManagementScreen
 * --------------------------------------------------
 * 用户点击“导入书籍” -> 复制到 "/books" 目录
 * 然后调用 parseAndSaveEpub(localPath) 做深入解析 + 保存到DB
 * UI 仍然保留之前的主题/颜色写法
 */
export default function BookManagementScreen() {
  // 这里保留 state 只做演示; 若你打算完全用 DB, 可省略
  const [books, setBooks] = useState<{ name: string; uri: string }[]>([]);

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

  /**
   * handleImportBook:
   * 1) 弹出文件选择器 -> 获取 { name, uri }
   * 2) 复制到 documentDirectory + 'books/'
   * 3) 调用 parseAndSaveEpub(localPath) 做文件解析 + 数据库存储
   * 4) 更新本地 state 以便在当前UI上列出
   */
  const handleImportBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const { name, uri } = file;

        // step1: 准备 /books 目录
        const booksDir = FileSystem.documentDirectory + 'books/';
        const dirInfo = await FileSystem.getInfoAsync(booksDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
        }

        // step2: 复制到本地
        const localPath = booksDir + name;
        await FileSystem.copyAsync({ from: uri, to: localPath });
        console.log('已复制到本地:', localPath);

        // step3: 调用 parseAndSaveEpub 做解析并存数据库
        try {
          const bookId = await parseAndSaveEpub(localPath);
          console.log('🎉 成功解析并写入 DB, bookId:', bookId);
        } catch (parseErr) {
          console.error('解析 / 存储 epub 出错:', parseErr);
        }

        // step4: 更新本地 state (仅用于本页面显示)
        setBooks((prev) => [...prev, { name, uri: localPath }]);

      } else {
        console.log('未选择任何文件');
      }
    } catch (err) {
      console.error('导入文件出错:', err);
    }
  };

  /**
   * handleOpenReader
   * 让用户跳转到阅读器, 并传递 { path }
   */
  const handleOpenReader = (path: string) => {
    navigation.navigate('reader', { path });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, theme.fonts.titleLarge]}>书籍管理</Text>

      {/* 导入按钮 (Paper Button + tint 颜色) */}
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
          <Text style={{ color: theme.colors.onBackground }}>
            暂无书籍
          </Text>
        ) : (
          books.map((book, index) => (
            <View key={index} style={styles.bookItem}>
              <Text style={[styles.bookName, { color: theme.colors.onBackground }]}>
                {book.name}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{book.uri}</Text>

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
