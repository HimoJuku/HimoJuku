// app/DatabaseTest/index.tsx

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '../../db'; // 根据你的项目结构调整路径
import Book from '../../db/Book';   // Book 模型

export default function DatabaseTest() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 每次页面进入时重新查询数据库
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const fetchedBooks = await database.collections.get<Book>('books').query().fetch();
      console.log('Fetched books:', fetchedBooks);
      setBooks(fetchedBooks);
    } catch (err: any) {
      setError(err.message || String(err));
      console.error('Database test error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>正在加载数据库数据...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>数据库测试出错: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>数据库测试 - 书籍记录</Text>
      {books.length === 0 ? (
        <Text style={styles.emptyText}>暂无书籍记录</Text>
      ) : (
        books.map((book, index) => (
          <View key={index} style={styles.bookItem}>
            <Text style={styles.bookTitle}>书名: {book.title}</Text>
            <Text>作者: {book.author || '-'}</Text>
            <Text>文件路径: {book.filePath}</Text>
            <Text>简介: {book.description || '-'}</Text>
            <Text>导入时间: {new Date(book.importedAt).toLocaleString()}</Text>
            <Text>上次阅读: {book.lastReadPosition || '-'}</Text>
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                style={styles.coverImage}
              />
            ) : (
              <Text>封面: -</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    marginTop: 8,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  bookItem: {
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coverImage: {
    width: 100,
    height: 140,
    marginTop: 8,
    resizeMode: 'cover',
  },
});
