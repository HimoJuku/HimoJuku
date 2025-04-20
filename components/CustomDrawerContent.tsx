import React from 'react';
import {
  SafeAreaView,
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
import Gradient from '@/components/Gradient';
//Calculate the width of the drawer based on the screen size
const drawerWidth =
  Dimensions.get('window').width*0.55

// Will become the cover of latest book
function DrawerCover() {
  return (
      <View style={styles.coverFrame}>
        <View style={styles.headerImage}>
          <Image
            source={{ uri: 'https://pic1.imgdb.cn/item/67d09faa066befcec6e366fe.png'}}
            style={{width: '100%', height: '100%', resizeMode: 'cover', zIndex: -2}}
          />
          <Gradient fromColor='#006699' toColor='#00CCFF' />
        </View>
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingStart: 1,
    paddingEnd: 1,
    paddingTop: 0,
  },
  coverFrame: {
    height: drawerWidth*18/13,
    width: drawerWidth,
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