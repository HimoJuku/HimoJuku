import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '@/db';
import Book from '@/db/models/books';
import Chapter from '@/db/models/Chapter';
import { Q } from '@nozbe/watermelondb';

type ChapterMap = Record<string, Chapter[]>;

export default function DatabaseTest() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [chaptersMap, setChaptersMap] = useState<ChapterMap>({});
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const fetchedBooks = await database.collections
        .get<Book>('books')
        .query()
        .fetch();
      setBooks(fetchedBooks);

      const chapterResults: ChapterMap = {};

      // 遍历每本书，读取对应章节
      for (const book of fetchedBooks) {
        const chs = await database.collections
          .get<Chapter>('chapters')
          .query(Q.where('book_id', book.id), Q.sortBy('order', 'asc') )
          .fetch();
        chapterResults[book.id] = chs;
        console.log(`Book "${book.title}" chapters:`, chs.slice(0, 5).map(c => c.title));
      }

      setChaptersMap(chapterResults);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>正在加载数据库数据...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>数据库测试出错: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}> 数据库测试 - 书籍与章节信息</Text>
      {books.length === 0 ? (
        <Text style={styles.emptyText}>暂无书籍记录</Text>
      ) : (
        books.map((book) => {
          const bookChapters = chaptersMap[book.id] || [];

          return (
            <View key={book.id} style={styles.bookBlock}>
              <View style={styles.bookItem}>
                <Text style={styles.bookTitle}> 书名: {book.title}</Text>
                <Text> 作者: {book.author || '-'}</Text>
                <Text> 路径: {book.filePath}</Text>
                <Text> 导入时间: {new Date(book.importedAt).toLocaleString()}</Text>
              </View>

              <View style={styles.chapterBlock}>
                <Text style={styles.subtitle}> 章节信息</Text>
                {bookChapters.length === 0 ? (
                  <Text style={styles.emptyText}>暂无章节数据</Text>
                ) : (
                  <>
                    <Text style={styles.chapterCount}>
                      共 {bookChapters.length} 章，预览前 {Math.min(bookChapters.length, 3)} 章：
                    </Text>
                    {bookChapters.slice(0, 3).map((ch, idx) => (
                      <Text key={ch.id} style={styles.chapterItem}>
                        {idx + 1}. {ch.title}
                      </Text>
                    ))}
                  </>
                )}
              </View>

              <View style={styles.divider} />
            </View>
          );
        })
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  message: {
    marginTop: 8,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bookBlock: {
    marginBottom: 24,
  },
  bookItem: {
    paddingVertical: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  chapterBlock: {
    marginTop: 8,
    marginLeft: 8,
  },
  chapterCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  chapterItem: {
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 12,
  },
});
