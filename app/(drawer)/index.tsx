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
  IconButton,
  Button,
  Menu,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '@/db';
import Book from '@/db/models/books';
import * as Sort from '@/functions/sort';

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
  const [sortMenu , setSortMenu] = React.useState(false);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const sub = database.get<Book>('books').query().observe()
      .subscribe((fresh) => {
        //const sorted = Sort.sortBooks(fresh, sortMethod,sortMethod.desc);
        setBooks(fresh);
      });
    return () => sub.unsubscribe();
  }, []);

  function setMethodNSort(method: Sort.SortIndex, desc: boolean) {
    setSortMethod({method: method, desc: desc});
    const sorted = Sort.sortBooks(books, {method: method, desc: desc});
    setBooks(sorted);
  }

  const onSort = () => {
    console.log('[onSort]','command:',[sortMethod,sortMethod.desc])
    const sorted = Sort.sortBooks(books, sortMethod);
    setBooks(sorted);
    console.log('[onSort] Sorted. Rresult: ', books.map((b) => b.importedAt));
  }

  const onRefresh = async () => {
    setRefreshing(true);
    const fresh = await database.get<Book>('books').query().fetch();
    console.log('[onRefresh] Data received: ',fresh.map((b) => b.id));
    onSort();
    setRefreshing(false);
  };

  //Open reader method
  const openReader = (path: string, bookId: string) => {
    router.push({
      pathname: '/reader',
      params: {
        path,
        bookId,
      },
    });
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
    menuItem: {width: '100%'},
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
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface, 
      }} 
      elevation={0}
    >
      //Tool Container
        <Menu
          anchor = {
            <View
              style={{
                flexDirection: 'row',
                flex: 0,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginHorizontal: 15,
              }}
            >
              <Button
                mode="text"
                contentStyle={{
                  flexDirection: 'row-reverse',
                  marginLeft: "auto",
                }}
                onPress={()=>setSortMenu(true)}
                icon = {(props)=>(
                  <MaterialIcons 
                  name= {
                    sortMethod.desc
                    ? "arrow-upward"
                    : 'arrow-downward'
                  }
                  {...props}
                />
              )}
              >
                {sortMethod.method}
              </Button>
            </View>
          }
          anchorPosition='bottom'
          visible={sortMenu}
          onDismiss={() => setSortMenu(false)}
          theme={{ colors: { elevation: {level2: theme.colors.elevation.level1} } }}
          contentStyle={{
          }}
        >
          <Divider />
          <Menu.Item
            title="Title"
            style={
              (sortMethod.method === 'title')
                ? {backgroundColor: theme.colors.elevation.level5}
                : {}
            }
            titleStyle={
              (sortMethod.method === 'title')
              ?{color: theme.colors.primary}
              :{}
            }
            leadingIcon={
              (sortMethod.method === 'title')
              ? ()=>(
                <MaterialIcons 
                name= {
                  sortMethod.desc
                  ? "arrow-upward"
                  : 'arrow-downward'
                }
                size={20} color={theme.colors.primary}
                />
              )
              : {}
            }
            onPress={() => {
              (sortMethod.method === 'title')
                ? setMethodNSort('title', !sortMethod.desc)
                : setMethodNSort('title', sortMethod.desc);
            }}
          />
          <Menu.Item
            title="Author"
            style={
              (sortMethod.method === 'author')
                ? {backgroundColor: theme.colors.elevation.level5}
                : {}
            }
            titleStyle={
              (sortMethod.method === 'author')
              ?{color: theme.colors.primary}
              :{}
            }
            leadingIcon={
              (sortMethod.method === 'author')
              ? ()=>(
                <MaterialIcons 
                name= {
                  sortMethod.desc
                  ? "arrow-upward"
                  : 'arrow-downward'
                }
                size={20} color={theme.colors.primary}
                />
              )
              : {}
            }
            contentStyle={[styles.menuItem]}
            onPress={() => {
              (sortMethod.method === 'author')
                ? setMethodNSort('author', !sortMethod.desc)
                : setMethodNSort('author', sortMethod.desc);
            }}
          />
          <Menu.Item
            title="Access Date"
            style={
              (sortMethod.method === 'lastRead')
                ? {backgroundColor: theme.colors.elevation.level5}
                : {}
            }
            titleStyle={
              (sortMethod.method === 'lastRead')
              ?{color: theme.colors.primary}
              :{}
            }
            leadingIcon={
              (sortMethod.method === 'lastRead')
              ? ()=>(
                <MaterialIcons 
                name= {
                  sortMethod.desc
                  ? "arrow-upward"
                  : 'arrow-downward'
                }
                size={20} color={theme.colors.primary}
                />)
              : {}
            }
            onPress={() => {
              (sortMethod.method === 'lastRead')
                ? setMethodNSort('lastRead', !sortMethod.desc)
                : setMethodNSort('lastRead', sortMethod.desc);
            }}
          />
          <Menu.Item
            title="Date Added"
            style={
              (sortMethod.method === 'date')
                ? {backgroundColor: theme.colors.elevation.level5}
                : {}
            }
            titleStyle={
              (sortMethod.method === 'date')
              ?{color: theme.colors.primary}
              :{}
            }
            leadingIcon={
              (sortMethod.method === 'date')
              ? ()=>(
                <MaterialIcons 
                name= {
                  sortMethod.desc
                  ? "arrow-upward"
                  : 'arrow-downward'
                }
                size={20} color={theme.colors.primary}
                />
              )
              : {}
            }
            onPress={() => {
              (sortMethod.method === 'date')
                ? setMethodNSort('date', !sortMethod.desc)
                : setMethodNSort('date', sortMethod.desc);
            }}
          />
        </Menu>

      //Book Shelf
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
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