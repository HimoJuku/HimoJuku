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

const drawerWidth = //Calculate the width of the drawer based on the screen size
  (
    (Dimensions.get('window').width<Dimensions.get('window').height)
    ? Dimensions.get('window').width
    : Dimensions.get('window').height
  )* 8 / 18;

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* 放图片、背景用 */}
      <View style={styles.headerContainer}>
        <Image
          //现在背景用的是在线图床，待后面文件管理完善再改成读本地图片
          source={{ uri: 'https://pic1.imgdb.cn/item/67d09faa066befcec6e366fe.png' }}
          style={styles.headerImage}
        />
      </View>

      {/* DrawerItemList: 自动渲染 <Drawer.Screen> 中的路由*/}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#f0f0f0',      // 这里调图片的大小
    height: drawerWidth*18/13,
    width: drawerWidth,
    padding : 0,
    margin : 0,
  },
  headerImage: {     // 这里调图片的大小
    flex : 1,
    resizeMode: 'cover', 
  },
});