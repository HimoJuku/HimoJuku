// app/bookShelf/index.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Book } from '@/app/book/type';

type DrawerParamList = {
  bookShlef: undefined;
  reader: { path: string };
  bookManagement: undefined;
  settings: undefined;
};

export default function BookShelfScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  // 本地 State 来显示书籍
  const [books, setBooks] = React.useState<Book[]>([]);

  // 当书架页面获得焦点时，去 global 中拿最新的 books
  useFocusEffect(
    React.useCallback(() => {
      const globalBooks: Book[] = (global as any).globalBooks || [];
      console.log('【书架】刷新全局 books:', globalBooks);
      setBooks(globalBooks);
    }, [])
  );

  // 点击某本书 -> 跳转阅读器
  const openReader = (book: Book) => {
    navigation.navigate('reader', { path: book.filePath });
  };

  if (books.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>📖 书架空空如也</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的书架</Text>
      {books.map((bk) => (
        <TouchableOpacity
          key={bk.bookId}
          style={styles.bookItem}
          onPress={() => openReader(bk)}
        >
          <Text style={styles.bookTitle}>{bk.title}</Text>
          <Text style={styles.bookPath}>{bk.filePath}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  bookItem: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookPath: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
