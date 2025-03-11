import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function BookManagementScreen() {
  const [books, setBooks] = useState<{ name: string; uri: string }[]>([]);

  const handleImportBook = async () => {
    try {
      // 1. 调用系统文件选择器
      //    返回 { canceled: boolean; assets?: Array<Asset> }
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        // 如果想一次选择多个文件，可以设置 multiple: true（需要判断是否支持）
        multiple: false,
        // type: 'application/epub+zip', 
        // 这个type是用来过滤文件类型的，比如只选epub啥的，这里暂时注释掉，因为还没实现格式解析
      });

      // 2. 检查是否取消选择
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const { name, uri } = file;

        // 3. 读取后只是存到本地 state ，显示一大串base64编码 (待后续完善存储路径啥的)
        setBooks((prev) => [...prev, { name, uri }]);
      } else {
        console.log('用户取消或未选择任何文件');
      }
    } catch (err) {
      console.log('选择文件出错:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>书籍管理</Text>

      <Button title="导入书籍" onPress={handleImportBook} />

      <View style={styles.bookList}>
        {books.length === 0 ? (
          <Text style={styles.emptyText}>暂无书籍</Text>
        ) : (
          books.map((book, index) => (
            <View key={index} style={styles.bookItem}>
              <Text style={styles.bookName}>{book.name}</Text>
              <Text style={styles.bookUri}>{book.uri}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  bookList: {
    marginTop: 12,
  },
  emptyText: {
    color: '#666',
  },
  bookItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 6,
  },
  bookName: {
    fontWeight: 'bold',
  },
  bookUri: {
    fontSize: 12,
    color: '#999',
  },
});
