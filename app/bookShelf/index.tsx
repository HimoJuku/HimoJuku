import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { database } from '@/db';
import Book from '@/db/Book';

type DrawerParamList = {
  bookShelf: undefined;
  bookManagement: undefined;
  settings: undefined;
  reader: { path: string };
  databaseTest: undefined;
};

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
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

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
  };

  //点击封面 > 打开阅读器
  const openReader = (path: string) => {
    navigation.navigate('reader', { path });
  };

  if (books.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.onBackground }}>暂无书籍，去“书籍管理”导入吧！</Text>
      </View>
    );
  }

  return (
    <FlatList
      key={'grid-3'}       
      data={books}
      keyExtractor={(b) => b.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      numColumns={3}                        // 三列网格，后续可调整 
      contentContainerStyle={{ paddingVertical: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openReader(item.filePath)}>
          <Image
            source={
              item.coverUrl
                ? { uri: item.coverUrl }
                : require('../../assets/images/cover-placeholder.png') // 占位图
            }
            style={styles.cover}
          />
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.author}>{item.author || '未知作者'}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

//Waiting for more detailed changes by @karl@xiaohuo
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '30%',               // 为了塞下三列
    marginHorizontal: '1.66%',
    marginBottom: 12,
    alignItems: 'center',
  },
  cover: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 4,
    backgroundColor: '#CCC',
  },
  title: { fontSize: 12, fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
  author: { fontSize: 10, color: '#666', marginTop: 2 },
});
