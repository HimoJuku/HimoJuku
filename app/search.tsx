import { SafeAreaView } from 'react-native-safe-area-context';
import Search , {SearchByAuthor, SearchByTitle} from '@/functions/searchBooks';
import Book from '@/db/models/books';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text, Card, Chip, Button, Avatar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { searchBy } from '@/constants/search';

/**
 * SearchScreen
 * This component is used to search for books in the library.
 * The query is passed as a parameter from the navigation header.
 */
export default function SearchScreen() {
    // Get the query from the search header params
    const { query } = useLocalSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // State to manage the search type (All, Title, Author)
    const [searchType, setSearchType] = useState<searchBy>({ shown: 'All' });
    const router = useRouter();
    // Execute the search function when the query changes
    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query]);

    useEffect(() => {
        if (searchType) {
            handleSearch();
        }
    }, [searchType]);
    /**
     * handleSearch
     * This function is used to search for books in the library.
     */
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = searchType.shown === 'All' ? await Search(query as string)
            : searchType.shown === 'Title' ? await SearchByTitle(query as string)
            : await SearchByAuthor(query as string);
            if (result && result.length > 0) {
                setBooks(result);
            } else {
                setBooks([]);
                setError('No results found');
            }
        } catch (err) {
            setError('An error occurred while searching');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

      //Open reader method
    const openReader = (path: string) => {
        router.push(
        {
            pathname: '/reader',
            params: {
            path: path
            }
        }
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <View style={styles.chipContainer}>
                <View style={styles.chipRowContainer}>
                    <Chip onPress={() =>
                        setSearchType({ shown: 'All' })
                    }
                    style={styles.chip}
                    selected={searchType.shown === 'All'}>
                        <Text style={styles.chipText}>All</Text>
                    </Chip>
                </View>
                <View style={styles.chipRowContainer}>
                    <Chip onPress={() =>
                        setSearchType({ shown: 'Title' })

                    }
                    style={styles.chip}
                    selected={searchType.shown === 'Title'}
                    >
                        <Text style={styles.chipText}>Title</Text>
                    </Chip>
                </View>
                <View style={styles.chipRowContainer}>
                    <Chip onPress={() =>
                        setSearchType({ shown: 'Author' })
                    }
                    style={styles.chip}
                    selected={searchType.shown === 'Author'}
                    >
                        <Text style={styles.chipText}>Author</Text>
                    </Chip>
                </View>
            </View>
            { (searchType.shown === 'All' || searchType.shown === 'Title') &&
            <View style={styles.titleContainer} >
                <Button icon="arrow-right" mode="text" onPress={() => console.log('Pressed')}contentStyle={styles.title} labelStyle={{ fontSize: 20, verticalAlign:"bottom"}} >
                    <Text variant='headlineSmall'>With Title</Text>
                </Button>
                {error ?
                <Text style={styles.empty}>No result from "{query}" by Title</Text>
                :
                <View style={styles.titleRowContainer}>
                    <FlatList style={{ flexDirection: 'row',flex: 1}}
                    horizontal={true}
                    data={books}
                    refreshControl={<RefreshControl refreshing={loading} />}
                    renderItem={({ item }) => (
                        <Card
                        elevation={0}
                        onPress={() => openReader(item.filePath)}
                        style={styles.bookContainer}
                        >
                            <Image
                            style={[styles.bookCover]}
                            source={
                                item.coverUrl
                                    ? { uri: item.coverUrl }
                                    : require('@/assets/images/cover-placeholder.png')
                                }
                                />
                            <Text style={styles.bookTitle}>
                            {item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title}
                            </Text>
                            <Text style={styles.bookSubtitle}>
                            {item.author}
                            </Text>
                        </Card>

                        )}
                        />
                </View>}
            </View>
            }
            }
            { (searchType.shown === 'All' || searchType.shown === 'Author') &&
            <View style={styles.authorContainer}>
                <Button icon="arrow-right" mode="text" onPress={() => console.log('Pressed')} contentStyle={styles.title} labelStyle={{ fontSize: 20, verticalAlign: "bottom" }}>
                    <Text variant='headlineSmall'>With Author</Text>
                </Button>
                {error ?
                <Text style={styles.empty}>No result from "{query}" by Author</Text>
                :
                <FlatList style={styles.authorRowContainer}
                    data={books}
                    keyExtractor={(b) => b.id}
                    refreshControl={<RefreshControl refreshing={loading} />}
                    renderItem={({ item }) => (
                        <Card style={styles.avatar}
                            elevation={0}
                            onPress={() => openReader(item.filePath)}>
                            <Avatar.Icon
                                size={100}
                                icon="account"
                                style={styles.avatar} />
                            <Text style={styles.author}>
                                {item.author}
                            </Text>
                        </Card>
                    )}/>}
                </View>
                }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    chipContainer: {
        alignContent: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    chipRowContainer: {
        paddingEnd: 10,
    },
    chip: {
        borderRadius: 20
    },
    chipText: {
        fontSize: 16,
        padding: 5,
        paddingInline: 10,
        },
    empty:{
        flex: 1,
        fontSize: 20,
        alignSelf: 'center',
        color: useTheme().colors.error,
        },
    titleContainer:{
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    title:{
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end',
        height: 50,
    },
    titleRowContainer:{
        flex: 1
    },
    bookContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginStart: 10,
        marginBottom: 10,
        maxWidth: 150,
    },
    bookCover:{
        justifyContent: 'center',
        alignItems: 'center',
        width:"100%"
    },
    bookTitle:{
        fontWeight: 'bold',
        textAlign: 'center'
    },
    bookSubtitle:{
        textAlign: 'center',
        color: '#888',
    },
    authorContainer:{
        flex: 1,
        justifyContent: 'flex-start',
    },
    authorRowContainer:{
        flexDirection: 'row',
        flex: 1,
        padding: 10,
    },
    avatar:{
        marginStart: 10,
        marginBottom: 10,
        alignSelf: 'center',
    },
    author:{
        alignSelf: 'center',
    }
})