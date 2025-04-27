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
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '@/db';
import Book from '@/db/models/books';
import * as Sort from '@/functions/sort';
import * as Shelf from '@/components/ShelfItem';
import { desc, on } from '@nozbe/watermelondb/QueryDescription';
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
  //default sort method
  const [sortMethod, setSortMethod] = React.useState<Sort.SortMethod>({method: 'author', desc: false});
  const theme = useTheme();
  const router = useRouter();

  /** Subscribe to Book changes */
  useEffect(() => {
    const sub = database.get<Book>('books').query().observe()
      .subscribe((fresh) => {
        //const sorted = Sort.sortBooks(fresh, sortMethod,sortMethod.desc);
        setBooks(fresh);
      });
    return () => sub.unsubscribe();
  }, []);

  const toggleDesc = () => {
    setSortMethod({method: sortMethod.method, desc: !sortMethod.desc});
  }

  function setMethodNSort(method: Sort.sortIndex, desc: boolean) {
    setSortMethod({method: method, desc: desc});
    const sorted = Sort.sortBooks(books, {method: method, desc: desc});
    setBooks(sorted);
  }

  const onSort = () => {
    console.log('[onSort]','command:',[sortMethod,sortMethod.desc])
    const sorted = Sort.sortBooks(books, sortMethod);
    setBooks(sorted);
    console.log('[onSort] Sorted. Rresult: ', books.map((b) => b.title));
  }

  const onRefresh = async () => {
    setRefreshing(true);
    const fresh = await database.get<Book>('books').query().fetch();
    console.log('[onRefresh] Data received: ',fresh.map((b) => b.id));
    onSort();
    setRefreshing(false);
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
      //Tool Container
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginStart: 15,
          marginEnd: 15,
          marginBottom: 2,
        }}
      >
        <Button
          mode="text"
          contentStyle={{
            flexDirection: 'row-reverse',
          }}
          icon = {(props)=>(
            <MaterialIcons 
            name= {
              sortMethod.desc
              ? "arrow-upward"
              : 'arrow-downward'
            }
            {...props}
            />)
          }
          onPress={()=>{
            setMethodNSort('title', !sortMethod.desc);
          }}
        >
          {sortMethod.method}
        </Button>
      </View>
      //Book Shelf
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
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