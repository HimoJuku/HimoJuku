// app/reader/TOC.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { Surface, Text, useTheme, List, Portal } from 'react-native-paper';
import { database } from '@/db';
import Chapter from '@/db/models/Chapter';
import { Q } from '@nozbe/watermelondb';

interface TOCProps {
  bookId: string;
  visible: boolean;
  onClose: () => void;
  onSelectChapter: (href: string) => void;
}

const PANEL_WIDTH   = Dimensions.get('window').width * 0.7;
const ANIM_DURATION = 250;

export default function TOC({
  bookId,
  visible,
  onClose,
  onSelectChapter,
}: TOCProps) {
  const { colors } = useTheme();

  const [chapters, setChapters] = useState<Chapter[]>([]);

  const panelX      = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const maskOpacity = useRef(new Animated.Value(0)).current;

  // 加载章节
  useEffect(() => {
    if (!bookId) return;
    database
      .get<Chapter>('chapters')
      .query(Q.where('book_id', bookId), Q.sortBy('order', Q.asc))
      .fetch()
      .then(setChapters)
      .catch((err) => console.error('[TOC] 章节加载失败:', err));
  }, [bookId]);

  // 显示/隐藏动画
  useEffect(() => {
    Animated.parallel([
      Animated.timing(panelX, {
        toValue: visible ? 0 : -PANEL_WIDTH,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(maskOpacity, {
        toValue: visible ? 0.35 : 0,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <Portal>
      {/* 背景遮罩 */}
      <Animated.View
        style={[styles.overlay, { opacity: maskOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* 侧栏滑出区域 */}
      <Animated.View
        style={[styles.panel, { transform: [{ translateX: panelX }] }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Surface style={[styles.surface, { backgroundColor: colors.surface }]}>
          <Text variant="titleMedium" style={styles.title}>目录</Text>

          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.title}
                onPress={() => {
                  console.log('[TOC] item pressed:', item.id, item.href);
                  onSelectChapter(item.href);
                  onClose();
                }}
                rippleColor={colors.secondaryContainer}
                style={styles.listItem}
              />
            )}
          />
        </Surface>
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: PANEL_WIDTH,
  },
  surface: {
    flex: 1,
    elevation: 4,
    paddingTop: 24,
  },
  title: {
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  listItem: {
    paddingVertical: 4,
  },
});
