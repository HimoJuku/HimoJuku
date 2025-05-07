import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import {
    Dimensions,
} from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';

export default function DrawerLayout() {
    const drawerWidth = Dimensions.get('screen').width*0.58;
    return (
            <Drawer
            initialRouteName="index"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={() => ({
                drawerActiveTintColor: useTheme().colors.onPrimary,
                drawerActiveBackgroundColor: useTheme().colors.primary,
                drawerInactiveTintColor: useTheme().colors.onSurfaceVariant,
                drawerStyle: {
                    width: drawerWidth,
                    backgroundColor: useTheme().colors.primaryContainer,
                },
                drawerItemStyle: {
                    width: drawerWidth - 10,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 80,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 80,
                },
                headerShown: true,
                header: () => <Header/>,
                })}>
                <Drawer.Screen
                    name="index"
                    options={{
                    title: 'Book Shelf',
                    drawerIcon: ({color, size}) => (
                        <MaterialIcons name="book" size={size} color={color} />
                    )
                    }}
                    />
                <Drawer.Screen
                    name="bookManagement"
                    options={{
                    title: 'Book Management',
                    drawerIcon: ({color, size}) => (
                        <MaterialIcons name="library-add" size={size} color={color} />
                    )
                    }}
                />
                <Drawer.Screen
                    name="databaseTest"
                    options={{
                    title: 'For Testing',
                    drawerIcon: ({color, size}) => (
                        <MaterialIcons name="bug-report" size={size} color={color} />
                    )
                    }}
                />
                <Drawer.Screen
                    name="settings"
                    options={{
                    title: 'Setting',
                    drawerIcon: ({color, size}) => (
                        <MaterialIcons name="settings" size={size} color={color} />
                    )
                    }}
                />
                </Drawer>
    );
}
