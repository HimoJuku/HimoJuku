import { database } from '@/db';
import Book from '@/db/models/books';
import { Q } from '@nozbe/watermelondb';

export async function searchByTitle(title: string) {
    const books = await database.collections
        .get<Book>('books')
        .query(Q.where('title', Q.like(`%${title}%`)))
        .fetch();
    return books.map((book) => ({
        id: book.id,
        title: book.title,
    }));
}

export async function searchByAuthor(author: string) {
    const books = await database.collections
        .get<Book>('books')
        .query(Q.where('author', Q.like(`%${author}%`)))
        .fetch();
    return books.map((book) => ({
        id: book.id,
        title: book.title,
    }));
}