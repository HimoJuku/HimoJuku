import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';


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
    marginBottom: 100,       // 这里增加图片与菜单项的间距
  },
  headerImage: {
    // 占满抽屉的宽度
    width: '90%',
    height: 180, 
    resizeMode: 'cover', 
  },
});