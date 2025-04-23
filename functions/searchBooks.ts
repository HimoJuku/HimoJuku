import { database } from '@/db';
import Book from '@/db/models/books';
import { Q } from '@nozbe/watermelondb';

export async function SearchByTitle(title: string): Promise<Book[]> {
    const books = await database.collections
        .get<Book>('books')
        .query(Q.where('title', Q.like(`%${title}%`)))
        .fetch();
        return books
}

export async function SearchByAuthor(author: string): Promise<Book[]> {
    const books = await database.collections
        .get<Book>('books')
        .query(Q.where('author', Q.like(`%${author}%`)))
        .fetch();
    return books
}

export default async function Search(query: string): Promise<Book[] | null> {
    const booksByTitle = await SearchByTitle(query);
    if (booksByTitle.length > 0) {
        return booksByTitle;
    }

    const booksByAuthor = await SearchByAuthor(query);
    if (booksByAuthor.length > 0) {
        return booksByAuthor;
    }

    return null;
}