import React, { useEffect, useState } from 'react';
import { 
    View, 
    FlatList, 
    RefreshControl, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    Dimensions
  } from 'react-native';
  import { 
    Surface, 
    Text, 
    useTheme,
    Card,
    Button,
    List,
    Avatar
  } from 'react-native-paper';
  import { useNavigation } from '@react-navigation/native';
  import { DrawerNavigationProp } from '@react-navigation/drawer';
  
  import { database } from '@/db';
  import Book from '@/db/models/books';
  import * as sort from '@/app/bookShelf/sort';
  import CardTitle from 'react-native-paper/lib/typescript/components/Card/CardTitle';
  
export function BookItem(item: Book) {
  return (
    <Card
    elevation={0}
    onPress={() => openReader(item.filePath)}
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