import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

//Calculate the width of the drawer based on the screen size
const drawerWidth =
  (
    (Dimensions.get('window').width<Dimensions.get('window').height)
    ? Dimensions.get('window').width
    : Dimensions.get('window').height
  )* 8 / 18+20;


export function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <DrawerCover />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
// Will become the cover of latest book
function DrawerCover() {
  return (
    <Image
      source={{ uri: 'https://pic1.imgdb.cn/item/67d09faa066befcec6e366fe.png' }}
      style={styles.headerImage}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingStart: 1,
    paddingEnd: 1,
    paddingTop: 0,
  },
  headerContainer: {
    backgroundColor: '#f0f0f0',
    height: drawerWidth*18/13,
    width: drawerWidth,
    padding : 0,
    margin : 0,
  },
  headerImage: {
    height: drawerWidth*18/13,
    width: drawerWidth,
    padding : 0,
    margin : 0,
    resizeMode: 'cover',
  },
});