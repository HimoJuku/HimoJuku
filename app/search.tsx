// SearchScreen.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '@/functions/searchBooks';
import Book from '@/db/models/books';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text, Card, Chip, Button, Avatar, TouchableRipple} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { searchBy } from '@/constants/search';

export default function SearchScreen() {
    const { query } = useLocalSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<searchBy>({ shown: 'All' });
    const router = useRouter();
    
    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await Search(query as string);
            if (result && result.length > 0) {
                setBooks(result);
            } else {
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
            {error && <Text>{error}</Text>}
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
                <View style={styles.titleRowContainer}>
                    <FlatList style={{ flexDirection: 'row',flex: 1}}
                    data={books}
                    keyExtractor={(b,) => b.id}
                    refreshControl={<RefreshControl refreshing={loading} />}
                    renderItem={({ item }) => (
                        <Card
                        elevation={0}
                        onPress={() => openReader(item.filePath)}
                        >
                        <Card.Title
                        style= {{
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 170,
                        marginTop: 15,
                        alignSelf: 'center',
                        }}
                        title={item.title}
                        titleNumberOfLines={2}
                        subtitle= {item.author}
                        left={() => (
                        <Image
                        style={[styles.image]}
                        source={
                            item.coverUrl
                                ? { uri: item.coverUrl }
                                : require('@/assets/images/cover-placeholder.png')
                            }
                            />
                        )}
                        leftStyle ={styles.leftStyle}
                        />
                        </Card>
                        )}
                        />
                </View>
            </View>
}
            { (searchType.shown === 'All' || searchType.shown === 'Author') &&
            <><View style={styles.authorContainer}>
                    <Button icon="arrow-right" mode="text" onPress={() => console.log('Pressed')} contentStyle={styles.title} labelStyle={{ fontSize: 20, verticalAlign: "bottom" }}>
                        <Text variant='headlineSmall'>With Author</Text>
                    </Button>
                </View><View style={styles.authorRowContainer}>
                        <FlatList style={{ flexDirection: 'row', flex: 1 }}
                            data={books}
                            keyExtractor={(b) => b.id}
                            refreshControl={<RefreshControl refreshing={loading} />}
                            renderItem={({ item }) => (
                                <Card style={styles.avatar}
                                    elevation={0}
                                    onPress={() => openReader(item.filePath)}
                                >
                                    <Avatar.Icon
                                        size={100}
                                        icon="account"
                                        style={styles.avatar} />
                                    <Text style={styles.author}>
                                        {item.author}
                                    </Text>
                                </Card>

                            )} />
                    </View></>}
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
    titleContainer:{
        flex: 1,
        justifyContent: 'flex-start'
    },
    title:{
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end',
        height: 50,
    },
    titleRowContainer:{
        flex: 1
    },
    image:{
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%",
        width: "100%",

    },
    leftStyle:{
        aspectRatio: 0.72,
        borderRadius: 4,
        width: 80,
        height: 200,
    },
    authorContainer:{
        flex: 0,
        justifyContent: 'flex-start'
    },
    authorRowContainer:{
        flex: 1
    },
    avatar:{
        marginStart: 10,
        marginBottom: 10,
        alignSelf: 'center',
    },
    author:{
        alignItems: 'center',
    }
})