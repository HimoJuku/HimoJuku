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
import { on } from '@nozbe/watermelondb/QueryDescription';
type DrawerParamList = {
  bookShelf: undefined;
  bookManagement: undefined;
  settings: undefined;
  reader: { path: string };
  databaseTest: undefined;
};

export default function BookshelfScreen() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reRenderBooks, setReRenderBooks] = useState(false);
  //default sort method
  const [sortMethod, setSortMethod] = React.useState<Sort.SortMethod>('title');
  const [sortDesc, setSortDesc] = React.useState<Sort.SortDesc>(false);
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
    setReRenderBooks(false);
    console.log('onRefresh',books.map((b) => b.id));
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
            console.log(sortDesc,'\n');
            Sort.sortBooks(books, sortMethod,sortDesc);
            setReRenderBooks(true);
            console.log('Buttom',books.map((b) => b.id));
          }}
        >
          {sortDesc? 'up':'down'}
        </Button>
      </View>
      <FlatList
        data={books}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          console.log('render',item.id),
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