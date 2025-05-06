import { SafeAreaView } from 'react-native-safe-area-context';
import Search , {SearchByAuthor, SearchByTitle} from '@/functions/searchBooks';
import Book from '@/db/models/books';
import React, { useState, useEffect } from 'react';
import { useTheme, ActivityIndicator, Text, Card, Chip, Button, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, FlatList, RefreshControl, Image} from 'react-native';
import { searchBy } from '@/constants/search';
import { openReader } from '@/functions/readerFunction';

/**
 * SearchScreen
 * This component is used to search for books in the library.
 * The query is passed as a parameter from the navigation header.
 */
export default function SearchScreen() {
    // Get the query from the search header params
    const { query } = useLocalSearchParams();
    const [titleResults, setTitleResults] = useState<Book[]>([]);
    const [authorResults, setAuthorResults] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // State to manage the search type (All, Title, Author)
    const [searchType, setSearchType] = useState<searchBy>({ shown: 'All' });
    const theme = useTheme();
    const router = useRouter();
    // Execute the search function when the query changes
    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query,searchType]);

    /**
     * handleSearch
     * This function is used to search for books in the library.
     */
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const byTitle = await SearchByTitle(query as string);
            const byAuthor = await SearchByAuthor(query as string);
            setTitleResults(byTitle);
            setAuthorResults(byAuthor);
            /*
            setBooks([...byTitle, ...byAuthor]);
            if (books.length === 0) {
                setError(`No results found for "${query}"`);
            }
            */
        } catch (err) {
            setError('An error occurred while searching');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {/* ========== Choose Search Filter ========== */}
            <View style={styles.chipContainer}>
                <View style={styles.chipRowContainer}>
                    <Chip onPress={() =>
                        setSearchType({ shown: 'All' })
                    }
                    style={styles.chip}
                    mode = {(searchType.shown === 'All') ? "flat": "outlined"}
                    >
                        <Text style={styles.chipText}>All</Text>
                    </Chip>
                </View>
                <View style={styles.chipRowContainer}>
                    <Chip onPress={() =>
                        setSearchType({ shown: 'Title' })

                    }
                    style={styles.chip}
                    mode = {(searchType.shown === 'Title') ? "flat": "outlined"}
                    >
                        <Text style={styles.chipText}>Title</Text>
                    </Chip>
                </View>
                <View style={styles.chipRowContainer}>
                    <Chip onPress={() =>
                        setSearchType({ shown: 'Author' })
                    }
                    style={styles.chip}
                    mode = {(searchType.shown === 'Author') ? "flat": "outlined"}
                    >
                        <Text style={styles.chipText}>Author</Text>
                    </Chip>
                </View>
            </View>
            {/* ========== Title Search Result ========== */}
            { (searchType.shown === 'All' || searchType.shown === 'Title') && (titleResults.length > 0) &&
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
                    data={titleResults}
                    refreshControl={<RefreshControl refreshing={loading} />}
                    renderItem={({ item }) => (
                        <Card
                        elevation={0}
                        onPress={() => openReader(item.filePath, item.id, router)}
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
            {/* ========== Author Search Result ========== */}
            { (searchType.shown === 'All' || searchType.shown === 'Author') && (authorResults.length > 0) &&
            <View style={styles.authorContainer}>
                <Button icon="arrow-right" mode="text" onPress={() => console.log('Pressed')} contentStyle={styles.title} labelStyle={{ fontSize: 20, verticalAlign: "bottom" }}>
                    <Text variant='headlineSmall'>With Author</Text>
                </Button>
                {error ?
                <Text style={styles.empty}>No result from "{query}" by Author</Text>
                :
                <View style={styles.authorRowContainer}>
                    <FlatList style={{ flexDirection: 'row',flex: 1}}
                        data={authorResults}
                        horizontal={true}
                        keyExtractor={(b) => b.id}
                        refreshControl={<RefreshControl refreshing={loading} />}
                        renderItem={({ item }) => (
                            <Card style={styles.avatar}
                                elevation={0}
                                onPress={() => openReader(item.filePath, item.id, router)}>
                                <Avatar.Icon
                                    size={100}
                                    icon="account"
                                    style={styles.avatar} />
                                <Text style={styles.author}>
                                    {item.author}
                                </Text>
                            </Card>
                        )}/>
                        </View>
                        }
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
        alignSelf: 'center'
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
        maxHeight: 300,
    },
    bookCover:{
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        width: "100%",
        resizeMode: 'cover',
    },
    bookTitle:{
        minWidth: 130,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    bookSubtitle:{
        textAlign: 'center',
        color: '#888',
    },
    authorContainer:{
        flex: 1,
    },
    authorRowContainer:{
        flex: 1,
        padding: 10,
    },
    avatar:{
        marginStart: 10,
        marginBottom: 10,
    },
    author:{
        alignSelf: 'center',
    }
})