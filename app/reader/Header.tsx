import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { useReader } from '@himojuku/epubjs-react-native';

export interface HeaderProps {
  onOpenSearch: () => void;
  onOpenBookmarksList: () => void;
}

export default function Header({
  onOpenSearch,
  onOpenBookmarksList,
}: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
  } = useReader();

  const handleToggleBookmark = async () => {
    const loc = getCurrentLocation();
    if (!loc) return;
    if (isBookmarked) {
      const bm = bookmarks.find(b =>
        b.location.start.cfi === loc.start.cfi &&
        b.location.end.cfi   === loc.end.cfi
      );
      if (bm) removeBookmark(bm);
    } else {
      addBookmark(loc);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryContainer }]}>
      <IconButton
        icon="arrow-left"
        size={24}
        iconColor={colors.onSurface}
        onPress={() => router.back()}
      />

      <View style={styles.actions}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems:   'center',
    justifyContent: 'space-between',
    height:       48,
    paddingHorizontal: 8,
    elevation:    2,
  },
  actions: {
    flexDirection: 'row',
    alignItems:   'center',
  },
});
