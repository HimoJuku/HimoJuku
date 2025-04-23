// SearchScreen.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '@/functions/searchBooks';
import Book from '@/db/models/books';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Card, Paragraph } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

export default function SearchScreen() {
    const { query } = useLocalSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, margin: 16 }}>Search Results for "{query}"</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text>{error}</Text>}
            {books.map((book) => (
                <Card key={book.id}>
                    <Card.Title title={book.title} subtitle={book.author} />
                    <Card.Content>
                        <Paragraph>{book.description}</Paragraph>
                    </Card.Content>
                </Card>
            ))}
        </SafeAreaView>
    );
}
