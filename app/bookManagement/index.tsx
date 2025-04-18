// app/bookManagement/index.tsx

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
 * ----------------------
 * Allows users to import an EPUB file, copy it to the app's storage, and then
 * parse the file to extract and save its metadata into the database.
 */
export default function BookManagementScreen() {
  const [books, setBooks] = useState<{ name: string; uri: string }[]>([]);
  const theme = useTheme();
  const colorScheme = useColorScheme(); 
  const tint = Colors[colorScheme ?? 'light'].colors.primary;
  
  type DrawerParamList = {
    bookShlef: undefined;
    bookManagement: undefined;
    settings: undefined;
    reader: { path: string };
  };
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  // Import file, copy it locally, parse metadata, store in DB, and update list.
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
        const dirInfo = await FileSystem.getInfoAsync(booksDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
        }
        const localPath = booksDir + name;
        await FileSystem.copyAsync({ from: uri, to: localPath });
        console.log('File copied locally:', localPath);
        try {
          const bookId = await parseAndSaveEpub(localPath);
          console.log('Successfully parsed and stored to DB, bookId:', bookId);
        } catch (parseErr) {
          console.error('Error parsing/storing EPUB:', parseErr);
        }
        setBooks(prev => [...prev, { name, uri: localPath }]);
      } else {
        console.log('No file selected');
      }
    } catch (err) {
      console.error('Error importing file:', err);
    }
  };

  // Navigate to the reader page
  const handleOpenReader = (path: string) => {
    navigation.navigate('reader', { path });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, theme.fonts.titleLarge]}>书籍管理</Text>
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
