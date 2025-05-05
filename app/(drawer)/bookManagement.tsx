// app/bookManagement/index.tsx
import { View, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File, Directory, Paths } from 'expo-file-system/next';
import { useTheme, Text, Button} from 'react-native-paper';

import ConvertToEpub from '@/functions/txt2epub';
import { TxtBook } from '@/constants/txtBooks';

import { stringMd5 } from 'react-native-quick-md5';
import { ParseAndSaveEpub } from '@/functions/_epubParser';

import { useRouter } from 'expo-router';

/**
 * BookManagementScreen
 * ----------------------
 * Allows users to import an EPUB file, copy it to the app's storage, and then
 * parse the file to extract and save its metadata into the database.
 */

export default function BookManagementScreen() {
  const [books, setBooks] = useState<{ name: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();
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
        console.log('directory:', Paths.cache);
        // Create books directory if it doesn't exist
        const booksDir = new Directory(Paths.document, 'books');
        if (!booksDir.exists) {
          booksDir.create();
        }
        // Create a File object from the picked file URI
        let sourceFile = new File(uri);
        const destBaseName = stringMd5(name.replace('.epub', '').replace('.opf', ''));
        const destName = destBaseName+'.epub';
        const destFile = new File(booksDir.uri + destName);
        // Check if the file has a valid EPUB extension
        switch(sourceFile.extension){
          case '.epub':
            if (destFile.exists) {
              console.log('Deleting existing EPUB file before copy:', destFile.uri);
              destFile.delete();
            }
            sourceFile.copy(destFile);
            break;
          case '.opf':
            if (destFile.exists) {
              console.log('Deleting existing EPUB file before copy:', destFile.uri);
              destFile.delete();
            }
            sourceFile.copy(destFile);
            break;
          case '.txt':
            if (destFile.exists) {
              console.log('Deleting existing file:', destFile.uri);
              destFile.delete();
            }
            console.log('This is a txt file, converting it to epub...');
            const destFolder = booksDir.uri;
            console.log('Destination:', destFolder + destName);
            const txtBook:TxtBook = {
              type: 'base',
              bookTitle: name.replace('.txt', ''),
              destFolder: destFolder,
              destName: destBaseName,
              language: '',
              content: sourceFile.text(),
            };
              try{
                await ConvertToEpub(txtBook,"");
                console.log('File converted to EPUB:', destName);
                break;
              }
              catch (err) {
                console.error('Error converting file to EPUB:', err);
                return;
              }

          default:
            console.log('Invalid file type. Please select an EPUB, OPF or TXT file.');
            return;
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
    router.push(
      {
        pathname: '/reader',
        params: {
          path: path,
        }
      })
    };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title]}>书籍管理</Text>
      <Button
        mode="contained"
        onPress={handleImportBook}
        style={{ marginBottom: 16 }}
        loading={loading}
        disabled={loading}
      >
        导入书籍
      </Button>
      <View style={styles.bookList}>
        {books.length === 0 ? (
          <Text style={{ color: colors.onBackground }}>暂无书籍</Text>
        ) : (
            books.map((book, index) => (
              <View key={index} style={styles.bookItem}>
                <Text style={[styles.bookName, { color: colors.onBackground }]}>
                  {book.name}
                </Text>
                <Text style={{ color: colors.onSurfaceVariant }}>{book.uri}</Text>
                <Button
                  mode="contained"
                  onPress={() => handleOpenReader(book.uri)}

                  style={{ marginTop: 8 }}
                >
                  阅读此书
                </Button>
              </View>
            )
          )
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
