// app/databaseTest.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
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

      /** 读取所有书籍 */
      const fetchedBooks = await database
        .get<Book>('books')
        .query()
        .fetch();
      setBooks(fetchedBooks);

      /** 针对每本书读取章节 */
      const chapterResults: ChapterMap = {};

      for (const book of fetchedBooks) {
        const chs = await database
          .get<Chapter>('chapters')
          .query(
            Q.where('book_id', book.id),
            Q.sortBy('order', Q.asc)       // ✅ 用 Q.asc
          )
          .fetch();

        chapterResults[book.id] = chs;

        console.log(
          `[TEST] "${book.title}" chapters count: ${chs.length}`,
          chs[0] ? `first: ${chs[0].title}` : '-- empty --'
        );
      }

      setChaptersMap(chapterResults);
    } catch (err: any) {
      setError(err.message || String(err));
      console.error('[DatabaseTest] error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>加载数据库数据…</Text>
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
      <Text style={styles.title}>数据库测试 ‑ 书籍 & 章节</Text>

      {books.length === 0 ? (
        <Text style={styles.emptyText}>暂无书籍记录</Text>
      ) : (
        books.map((book) => {
          const chs = chaptersMap[book.id] || [];

          return (
            <View key={book.id} style={styles.bookBlock}>
              {/* 书籍信息 */}
              <View style={styles.bookItem}>
                <Text style={styles.bookTitle}>书名: {book.title}</Text>
                <Text>作者: {book.author || '-'}</Text>
                <Text>路径: {book.filePath}</Text>
                <Text>导入: {new Date(book.importedAt).toLocaleString()}</Text>
              </View>

              {/* 章节预览 */}
              <View style={styles.chapterBlock}>
                <Text style={styles.subtitle}>章节信息</Text>
                {chs.length === 0 ? (
                  <Text style={styles.emptyText}>⚠️ 无章节数据</Text>
                ) : (
                  <>
                    <Text style={styles.chapterCount}>
                      共 {chs.length} 章，预览前 {Math.min(chs.length, 3)} 章：
                    </Text>
                    {chs.slice(0, 3).map((c, i) => (
                      <Text key={c.id} style={styles.chapterItem}>
                        {i + 1}. {c.title} (href: {c.href})
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

/* ---------- 样式 ---------- */
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
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, fontWeight: '600', marginVertical: 6 },
  message: { marginTop: 8 },
  error: { color: 'red', fontSize: 16 },
  emptyText: { fontSize: 14, fontStyle: 'italic', marginBottom: 4 },
  bookBlock: { marginBottom: 24 },
  bookItem: { paddingVertical: 8 },
  bookTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  chapterBlock: { marginTop: 8, marginLeft: 8 },
  chapterCount: { fontSize: 14, marginBottom: 4 },
  chapterItem: { fontSize: 14, marginBottom: 2, marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 12 },
});
