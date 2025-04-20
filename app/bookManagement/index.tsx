// app/bookManagement/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Directory, Paths } from 'expo-file-system/next';
import { useTheme, Button as PaperButton } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { ParseAndSaveEpub } from './epubParser';

import ConvertToEpub from '../txt2epub/converter';
import { TxtBook } from '../txt2epub/type';

import { stringMd5 } from 'react-native-quick-md5';
/**
 * BookManagementScreen
 * ----------------------
 * Allows users to import an EPUB file, copy it to the app's storage, and then
 * parse the file to extract and save its metadata into the database.
 */
export default function BookManagementScreen() {
  const [books, setBooks] = useState<{ name: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].colors.primary;
  
  type DrawerParamList = {
    bookShelf: undefined;
    bookManagement: undefined;
    settings: undefined;
    reader: { path: string };
  };
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  // Import file, copy it locally, parse metadata, store in DB, and update list.
  const handleImportBook = async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        const { name, uri } = pickedFile;
        // Create books directory if it doesn't exist
        const booksDir = new Directory(Paths.document, 'books');
        if (!booksDir.exists) {
          booksDir.create();
        }
        // Create a File object from the picked file URI
        let sourceFile = new File(uri);
        const destBaseName = stringMd5(name.replace('.epub', '').replace('.opf', ''));
        const destName = destBaseName+'.epub';
        // Check if the file has a valid EPUB extension
        if(sourceFile.extension != '.epub' && sourceFile.extension != '.opf'){
          if (sourceFile.extension == '.txt'){
            console.log('This is a txt file, converting it to epub...');
            const destFolder = booksDir.uri;
            console.log('Destination:', destFolder + destName);
            const txtBook:TxtBook = {
              type: 'base',
              bookTitle: name.replace('.txt', ''),
              destFolder: destFolder,
              destName: destBaseName,
              language: 'jp',
              content: sourceFile.text(),
          }
          await ConvertToEpub(txtBook,"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");
          console.log('File converted to EPUB:', destName);
          }
          else{
          console.log('Invalid file type. Please select an EPUB, OPF or TXT file.');
          return;
          }
        }
        // Create destination file path in books directory
        const destFile = new File(booksDir + destName);
        if (!destFile.exists) {
        sourceFile.copy(destFile);
        console.log('File copied locally:', destFile.uri);
        }else {
          console.log('File already exists:', destFile.uri);
        }
        try {
          const bookId = await ParseAndSaveEpub(destFile.uri);
          console.log('Successfully parsed and stored to DB, bookId:', bookId);
        } catch (parseErr) {
          console.error('Error parsing/storing EPUB:', parseErr);
        }
        
        setBooks(prev => [...prev, { name, uri: destFile.uri }]);
      } else {
        console.log('No file selected');
      }
    } catch (err) {
      console.error('Error importing file:', err);
    }
    setLoading(false);
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
        loading={loading}
        disabled={loading}
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
