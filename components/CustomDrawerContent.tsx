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
  )* 8 / 18;

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://pic1.imgdb.cn/item/67d09faa066befcec6e366fe.png' }}
          style={styles.headerImage}
        />
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#f0f0f0',
    height: drawerWidth*18/13,
    width: drawerWidth,
    padding : 0,
    margin : 0,
  },
  headerImage: {
    flex : 1,
    resizeMode: 'cover',
  },
});