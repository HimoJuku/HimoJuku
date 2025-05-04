import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, useTheme, Card, Text } from 'react-native-paper';
export interface FooterProps {
  onOpenTOC?: () => void;
  fontPickerVisible: boolean;
  onToggleFontPicker?: () => void;
  onToggleTheme?: () => void;
  settingsVisible: boolean;
  fontSize?: number;
  onChangeFontSize?: (size: number) => void;
  lineHeight?: number;
  onChangeLineHeight?: (height: number) => void;
  onToggleSettings: () => void;
  onChangeTypesettingDirection?: (direction: string) => void;
  typesettingDirections?: string;
  onChangeReadingDirection?: (direction: string) => void;
  readingDirections?: string;
}

export default function Footer({
  onOpenTOC = () => {},
  fontPickerVisible = false,
  onToggleFontPicker = () => {},
  fontSize = 16,
  onChangeFontSize = () => {},
  lineHeight = 1.5,
  onChangeLineHeight = () => {},
  onToggleTheme = () => {},
  settingsVisible = false,
  onToggleSettings = () => {},
  onChangeTypesettingDirection = () => {},
  typesettingDirections = 'horizontal',
  onChangeReadingDirection = () => {},
  readingDirections = 'left-to-right',
}: FooterProps) {
  const { colors } = useTheme();

  return (
    <View>
      {/* Font Panel - Only displayed when fontVisible is true */}
      {fontPickerVisible && (
        <Card style={[styles.settingsContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.settingsTitle}>Font Settings</Text>
            {/* Here you can add various settings options, such as font size, line height, theme, etc.*/}
            <View style={styles.settingsRow}>
              <Text>Font Size: {fontSize}</Text>
              <View style={styles.buttonsRow}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => onChangeFontSize(fontSize - 1)}
                  disabled={fontSize <= 12}
                />
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => onChangeFontSize(fontSize + 1)}
                  disabled={fontSize >= 24}
                />
              </View>
            </View>
            <View style={styles.settingsRow}>
              <Text>Line spacing: {lineHeight.toFixed(1)}</Text>
              <View style={styles.buttonsRow}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => onChangeLineHeight(lineHeight - 0.1)}
                  disabled={lineHeight <= 1.0}
                />
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => onChangeLineHeight(lineHeight + 0.1)}
                  disabled={lineHeight >= 2.0}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
      {/* Settings Panel - Only displayed when settingsVisible is true */}
      {settingsVisible && (
        <Card style={[styles.settingsContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.settingsTitle}>Reader Settings</Text>
            <View style={styles.settingsRow}>
              <Text>Display Direction: {typesettingDirections}</Text>
              <View style={styles.buttonsRow}>
                <IconButton
                  icon={typesettingDirections === 'horizontal' ? 'book-open' : 'book-open-outline'}
                  size={20}
                  onPress={() => onChangeTypesettingDirection(typesettingDirections === 'horizontal' ? 'vertical' : 'horizontal')}
                />
              </View>
            </View>
            <View style={styles.settingsRow}>
              <Text>Reading Direction: {readingDirections}</Text>
              <View style={styles.buttonsRow}>
              <IconButton
                  icon="book-arrow-left-outline"
                  size={20}
                  onPress={() => onChangeReadingDirection(readingDirections === 'right-to-left' ? 'left-to-right' : 'right-to-left')}
                  disabled={readingDirections === 'right-to-left'}
                />
                <IconButton
                  icon="book-arrow-right-outline"
                  size={20}
                  onPress={() => onChangeReadingDirection(readingDirections === 'left-to-right' ? 'right-to-left' : 'left-to-right')}
                  disabled={readingDirections === 'left-to-right'}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Bottom toolbar */}
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
          style={[styles.iconButton,
            fontPickerVisible && { backgroundColor: colors.primaryContainer }
          ]}
        />
        <IconButton
          icon="cog-outline"
          size={24}
          iconColor={colors.onSurface}
          onPress={onToggleSettings}
          style={[
            styles.iconButton,
            settingsVisible && { backgroundColor: colors.primaryContainer }
          ]}
        />
        <IconButton
          icon="white-balance-sunny"
          size={24}
          iconColor={colors.onSurface}
          onPress={onToggleTheme}
          style={styles.iconButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 8,
    elevation: 2,
  },
  settingsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    elevation: 4,
  },
  settingsTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
