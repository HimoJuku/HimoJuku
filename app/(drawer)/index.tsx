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
  Portal,
  Modal,
  Button
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { database } from '@/db';
import Book from '@/db/models/books';
import * as Sort from '@/functions/sort';
import SortMenu from '@/components/SortMenu';

export default function BookshelfScreen() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  //default sort method
  const [sortMethod, setSortMethod] = React.useState<Sort.SortMethod>({method: 'author', desc: false});
  const [sortMenu , setSortMenu] = React.useState(false);
  const [currentBook, setCurrentBook] = React.useState<Book | null>(null);
  const [bookPanelVisible, setBookPanelVisible] = React.useState(false);
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
      {/* Sort Menu */}
      <SortMenu
        sortMethod={sortMethod}
        setMethodNSort={setMethodNSort}
        sortMenuVisible={sortMenu}
        setSortMenuVisible={setSortMenu}
      />
      {/* Book List */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card
            elevation={0}
            onPress={() => openReader(item.filePath, item.id)}
            onLongPress={() => {
              setCurrentBook(item);
              setBookPanelVisible(true);
            }}
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
      {/* Modal for long press action */}
      <Portal>
        <Modal visible={bookPanelVisible} onDismiss={()=> setBookPanelVisible(false)} contentContainerStyle={styles.card}>
          <Card
            style={styles.card}>
            <Button
              mode="text"
              onPress={() => {
                setBookPanelVisible(false)
              database.write(async () => {
                if (currentBook?.id) {
                  const bookRecord = await database.get<Book>('books').find(currentBook.id);
                  if (bookRecord) {
                    bookRecord.markAsDeleted();
                    setBooks(books.filter((b) => b.id !== currentBook.id));
                  }
                }
              });
              }}>
                Delete Book
            </Button>
          </Card>
        </Modal>
      </Portal>
    </Surface>
  );
}

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
  menuItem: {width: '100%'},
});