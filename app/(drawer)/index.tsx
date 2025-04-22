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
  Card,
  Button
} from 'react-native-paper';
import { useRouter } from 'expo-router';

import { database } from '@/db';
import Book from '@/db/models/books';
import * as Sort from '@/functions/sort';
import * as Shelf from '@/components/ShelfItem';
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
  //default sort method
  const [sortMethod, setSortMethod] = useState<Sort.SortMethod>('title');
  const [sortDesc, setSortDesc] = useState<Sort.SortDesc>(false);
  const theme = useTheme();
  const router = useRouter();

  /** 实时订阅 Book 表 */
  useEffect(() => {
    const sub = database.get<Book>('books').query().observe()
      .subscribe((fresh) => {
        const sorted = Sort.sortBooks(fresh, sortMethod,sortDesc);
        setBooks(sorted);
      });
    return () => sub.unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const fresh = await database.get<Book>('books').query().fetch();
    const sorted = Sort.sortBooks(fresh, sortMethod,sortDesc);
    console.log('refreshed');
    setBooks(sorted);
    setRefreshing(false);
    console.log(books.map((b) => b.id));
  };

  //Open reader method
  const openReader = (path: string) => {
    router.push(
      {
        pathname: '/reader',
        params: {
          path: path
        }
      }
    );
  };


  const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: '10%'},
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
    title: { textAlign: 'left', textAlignVertical: 'top'},
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
          </Text>
        </View>
      </Surface>
    )
  }

  return (
    <Surface
      style={{ flex: 1, backgroundColor: theme.colors.surface }} elevation={0}
    >
      <View
        style={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginStart: 15,
          marginEnd: 15,
          marginBottom: 2,
        }}
      >
        <Button
          mode="outlined"
          onPress={()=>{
            setSortDesc(!sortDesc);
            console.log(sortDesc);
          }}
        >
          {sortDesc? 'up':'down'}
        </Button>
      </View>
      <FlatList
        data={books}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card
            elevation={0}
            onPress={() => openReader(item.filePath)}
            >
            <Card.Title
              style= {{
                flexDirection: 'row',
                padding: 10
              }}
              title={
                item.title
                ? item.title
                : "Undefined Title"
              }
              titleNumberOfLines={2}
              titleStyle={styles.title}
              subtitle= {
                item.author
                ? item.author
                : "Unknown Author"
              }
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