import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Image
} from 'react-native';
import {
  Surface,
  Text,
  useTheme,
  Card
} from 'react-native-paper';
import { useRouter } from 'expo-router';

import { database } from '@/db';
import Book from '@/db/models/books';

/**
 * Bookshelf
 * ----------
 * 作用：展示数据库中已导入的书籍列表。
 *  - 数据源：WatermelonDB => Book 表
 *  - 实时刷新：使用 observe/subscribe 或手动下拉刷新
 *  - 点击项后：导航到 reader 并携带 filePath
 *
 * DONE：
 *  1.自动从数据库读取（或下拉刷新）最新书籍信息，用简易faltlist显示封面、作者等信息
 *
 * TODO：
 *  1. 完成详细书架页面UI实现
 *  2. 加入分页等功能
 *  3. 联合右上角的排序、搜索等功能实现
 *  4. 将 FlatList 条目替换成真正的书架卡片 UI（封面 + 书名 + 进度等。--初步完成 也许需要修改样式
 *  5. 在点击封面时启用reader读取存储路径下书籍文件
 *  6. 长按弹出“删除/详情”等操作（optional）。
 */

export default function BookshelfScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  /** 实时订阅 Book 表 */
  useEffect(() => {
    const sub = database.get<Book>('books').query().observe().subscribe(setBooks);
    return () => sub.unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const fresh = await database.get<Book>('books').query().fetch();
    setBooks(fresh);
    setRefreshing(false);
    console.log(books.map((b) => b.id));
  };

  //Open reader method
  const openReader = (path: string, bookId: string) => {
    router.push({
      pathname: '/reader',
      params: {
        path,
        bookId,         // ← 一定要传
      },
    });
  };


  const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    cover: {
      height: '100%',
      aspectRatio: 0.72,
      borderRadius: 4,
      backgroundColor: '#CCC',
    },
    title: { fontSize: 12, fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
    author: {fontSize: 10, color: theme.colors.outline, marginTop: 2},
  });

  if (books.length === 0) {
    return (
      <Surface
        style={{ flex: 1, backgroundColor: theme.colors.surface }} elevation={0}
      >
        <View style={styles.center}>
          <Text style={{ color: theme.colors.onSurface }}>
            Empty Shelf
            {'\n'}
            {'\n'}
            {'\n'}
            {'\n'}
            {'\n'}
          </Text>
        </View>
      </Surface>
    );
  }



  return (
    <Surface
      style={{ flex: 1, backgroundColor: theme.colors.surface }} elevation={0}
    >
      <FlatList
        data={books}
        keyExtractor={(b,) => b.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card
            elevation={0}
            onPress={() => openReader(item.filePath, item.id)}
          >

            <Card.Title
              style= {{
                flexDirection: 'row',
                padding: 10
              }}
              title={item.title}
              titleNumberOfLines={2}
              subtitle= {item.author}
              left={(props) => (
                <Image
                  style={{
                    height: props.size,
                    borderRadius: 0,
                    flex: 1,
                    width: '100%',
                  }}
                  source={
                    item.coverUrl
                      ? { uri: item.coverUrl }
                      : require('@/assets/images/cover-placeholder.png')
                  }
                />
              )}
              leftStyle ={{
                aspectRatio: 0.72,
                borderRadius: 4,
                backgroundColor: '#CCC',
                padding: 0,
                width: '18%',
              }}
            />
          </Card>
        )}
      />
    </Surface>
  );
}