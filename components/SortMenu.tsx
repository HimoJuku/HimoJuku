import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Divider, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sort from '@/functions/sort';

interface SortMenuProps {
    sortMethod: Sort.SortMethod;
    setMethodNSort: (method: Sort.SortIndex, desc: boolean) => void;
    sortMenuVisible: boolean;
    setSortMenuVisible: (visible: boolean) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({
    sortMethod,
    setMethodNSort,
    sortMenuVisible,
    setSortMenuVisible
    }) => {
    const theme = useTheme();

    return (
        <Menu
        anchor={
            <View
            style={{
                flexDirection: 'row',
                flex: 0,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginHorizontal: 15,
            }}
            >
            <Button
                mode="text"
                contentStyle={{
                flexDirection: 'row-reverse',
                marginLeft: "auto",
                }}
                onPress={() => setSortMenuVisible(true)}
                icon={(props) => (
                <MaterialIcons
                    name={sortMethod.desc ? "arrow-upward" : 'arrow-downward'}
                    {...props}
                />
                )}
            >
                {sortMethod.method}
            </Button>
            </View>
        }
        anchorPosition='bottom'
        visible={sortMenuVisible}
        onDismiss={() => setSortMenuVisible(false)}
        theme={{ colors: { elevation: { level2: theme.colors.elevation.level1 } } }}
        >
        <Divider />
        <Menu.Item
            title="Title"
            style={
            (sortMethod.method === 'title')
                ? { backgroundColor: theme.colors.elevation.level5 }
                : {}
            }
            titleStyle={
            (sortMethod.method === 'title')
                ? { color: theme.colors.primary }
                : {}
            }
            leadingIcon={
            (sortMethod.method === 'title')
                ? () => (
                <MaterialIcons
                    name={sortMethod.desc ? "arrow-upward" : 'arrow-downward'}
                    size={20} color={theme.colors.primary}
                />
                )
                : undefined
            }
            onPress={() => {
            (sortMethod.method === 'title')
                ? setMethodNSort('title', !sortMethod.desc)
                : setMethodNSort('title', sortMethod.desc);
            setSortMenuVisible(false);
            }}
        />
        <Menu.Item
            title="Author"
            style={
            (sortMethod.method === 'author')
                ? { backgroundColor: theme.colors.elevation.level5 }
                : {}
            }
            titleStyle={
            (sortMethod.method === 'author')
                ? { color: theme.colors.primary }
                : {}
            }
            leadingIcon={
            (sortMethod.method === 'author')
                ? () => (
                <MaterialIcons
                    name={sortMethod.desc ? "arrow-upward" : 'arrow-downward'}
                    size={20} color={theme.colors.primary}
                />
                )
                : undefined
            }
            contentStyle={[styles.menuItem]}
            onPress={() => {
            (sortMethod.method === 'author')
                ? setMethodNSort('author', !sortMethod.desc)
                : setMethodNSort('author', sortMethod.desc);
            setSortMenuVisible(false);
            }}
        />
        <Menu.Item
            title="Access Date"
            style={
            (sortMethod.method === 'lastRead')
                ? { backgroundColor: theme.colors.elevation.level5 }
                : {}
            }
            titleStyle={
            (sortMethod.method === 'lastRead')
                ? { color: theme.colors.primary }
                : {}
            }
            leadingIcon={
            (sortMethod.method === 'lastRead')
                ? () => (
                <MaterialIcons
                    name={sortMethod.desc ? "arrow-upward" : 'arrow-downward'}
                    size={20} color={theme.colors.primary}
                />
                )
                : undefined
            }
            onPress={() => {
            (sortMethod.method === 'lastRead')
                ? setMethodNSort('lastRead', !sortMethod.desc)
                : setMethodNSort('lastRead', sortMethod.desc);
            setSortMenuVisible(false);
            }}
        />
        <Menu.Item
            title="Date Added"
            style={
            (sortMethod.method === 'date')
                ? { backgroundColor: theme.colors.elevation.level5 }
                : {}
            }
            titleStyle={
            (sortMethod.method === 'date')
                ? { color: theme.colors.primary }
                : {}
            }
            leadingIcon={
            (sortMethod.method === 'date')
                ? () => (
                <MaterialIcons
                    name={sortMethod.desc ? "arrow-upward" : 'arrow-downward'}
                    size={20} color={theme.colors.primary}
                />
                )
                : undefined
            }
            onPress={() => {
            (sortMethod.method === 'date')
                ? setMethodNSort('date', !sortMethod.desc)
                : setMethodNSort('date', sortMethod.desc);
            setSortMenuVisible(false);
            }}
        />
        </Menu>
    );
};

const styles = StyleSheet.create({
    menuItem: { width: '100%' },
});

export default SortMenu;
