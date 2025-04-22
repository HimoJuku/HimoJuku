import React, { useEffect, useState } from 'react';
import { 
    Image, 
  } from 'react-native';
  import { 
    Menu,
    Card,
    Button,
    Drawer,
  } from 'react-native-paper';

  import Book from '@/db/models/books';
  import * as sort from '@/app/bookShelf/sort';
const [currentSort, setCurrentSort] = React.useState('title');
const sortMenu = ()=>{
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  return(
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Button onPress={openMenu}>Show menu</Button>}
    >
      <Menu.Item onPress={() => {}} title="Item 1" />
      <Menu.Item onPress={() => {}} title="Item 2" />
      <Menu.Item onPress={() => {}} title="Item 3" />
    </Menu>
  );
}
export function SortButton(
  style?: any,
  ){
  return(
    <Button
      mode="outlined"
      onPress={()=>{
      }}
    >
      Press me
    </Button>
  );
}
export function BookItem(item: Book, somehook: any) {
  return (
    <Card
    elevation={0}
    onPress={() => somehook(item.filePath)}
    >
    <Card.Title
      style= {{
        flexDirection: 'row',
        padding: 10
      }}
      title={item.title}
      titleNumberOfLines={2}
      subtitle= {item.author}
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
              : require('@/assets/images/cover-placeholder.png') // 占位图
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
  );
}