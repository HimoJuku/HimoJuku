import { database } from '@/db';
import Book from '@/db/models/books';
import { Q } from '@nozbe/watermelondb';

/**
 * SearchByTitle
 * This function is used to search for books in the library by title.
 * @param title - The title of the book to search for.
 * @returns Books - An array of books that match the search criteria.
 */
export async function SearchByTitle(title: string): Promise<Book[]> {
    const books = await database.collections
        .get<Book>('books')
        .query(Q.where('title', Q.like(`%${title}%`)))
        .fetch();
        return books
}
/**
 *  SearchByAuthor
 * This function is used to search for books in the library by author.
 * @param author - The author of the book to search for.
 * @returns Books - An array of books that match the search criteria.
 */
export async function SearchByAuthor(author: string): Promise<Book[]> {
    const books = await database.collections
        .get<Book>('books')
        .query(Q.where('author', Q.like(`%${author}%`)))
        .fetch();
    return books
}
/**
 * Search
 * This function is used to search for books in the library by title or author.
 * @param query - The query to search for.
 * @returns Books - An array of books that match the search criteria.
 */
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