import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export interface FooterProps {
  onOpenTOC?: () => void;
  onToggleFontPicker?: () => void;
  onOpenAdvancedSettings?: () => void;
  onToggleTheme?: () => void;
}

export default function Footer({
  onOpenTOC = () => {},
  onToggleFontPicker = () => {},
  onOpenAdvancedSettings = () => {},
  onToggleTheme = () => {},
}: FooterProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryContainer }]}>
      <IconButton
        icon="format-list-bulleted"
        size={24}
        iconColor={colors.onSurface}
        onPress={onOpenTOC}
        style={styles.iconButton}
      />
      <IconButton
        icon="format-font"
        size={24}
        iconColor={colors.onSurface}
        onPress={onToggleFontPicker}
        style={styles.iconButton}
      />
      <IconButton
        icon="cog-outline"
        size={24}
        iconColor={colors.onSurface}
        onPress={onOpenAdvancedSettings}
        style={styles.iconButton}
      />
      <IconButton
        icon="white-balance-sunny"
        size={24}
        iconColor={colors.onSurface}
        onPress={onToggleTheme}
        style={styles.iconButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    justifyContent:    'space-evenly',
    alignItems:        'center',
    height:            64,
    paddingHorizontal: 8,
    elevation:         2,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
  },
});
