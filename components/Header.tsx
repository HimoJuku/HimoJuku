import {
    Appbar,
    useTheme,
    Searchbar,
} from 'react-native-paper';
import React from 'react';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

export function Header() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <Appbar.Header mode='center-aligned'>
      <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
      <Appbar.Action icon= "" />
      <Appbar.Content title="Himojuku" color={theme.colors.primary}/>
      <Appbar.Action icon="magnify" onPress={() => router.push('/search')} />
      <Appbar.Action icon="dots-vertical" onPress={() => {}} />
    </Appbar.Header>
  );
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = React.useState('');
  return (
      <Appbar.Header mode='medium' style={{backgroundColor:useTheme().colors.primary}}>
          <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          />
      </Appbar.Header>
  );
}