import React, {useEffect} from 'react';
import { database } from '@/db';
import Book from '@/db/models/books';
import { useTheme } from 'react-native-paper';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Gradient from '@/components/Gradient';
// Will become the cover of latest book
function DrawerCover() {
  const theme = useTheme();
  const [books, setBooks] = React.useState<Book[]>([]);
  useEffect(() => {
    const sub = database.get<Book>('books').query().observe()
      .subscribe((fresh) => {
        setBooks(fresh);
      });
    return () => sub.unsubscribe();
  }, []);
  return (
      <View style={styles.coverFrame}>
          <Image
            source={
              books.length > 0
                ? {uri: books[0].coverUrl}
                : require('@/assets/images/cover-placeholder.png')
            }
            style={{width: '100%', height: '100%', resizeMode: 'cover', zIndex: -2}}
          />
          <Gradient fromColor={theme.colors.primaryContainer}  toColor={theme.colors.primaryContainer} opacityColor1={0} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 0,
    paddingStart: 0,
    paddingEnd: 0,
  },
  coverFrame: {
    width: '100%',
    aspectRatio: 10/15,
    padding : 0,
    margin : 0,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    marginBottom: 10,
    resizeMode: 'cover',
  },
});

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <DrawerCover />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );

}