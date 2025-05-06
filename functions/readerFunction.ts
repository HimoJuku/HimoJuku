import {
    Router,
} from 'expo-router';

/**
 * openReader
 * ----------
 * Navigates to the reader page with the given path and book ID as parameters.
 *
 * @param path - The local file path of the book (e.g. "/data/.../books/myBook.epub")
 * @param bookId - The unique identifier of the book
 * @param router - The router object from expo-router
 */
export function openReader(path: string, bookId: string, router: Router):boolean{
    router.push({
        pathname: '/reader',
        params: {
        path,
        bookId,
        },
    });
    return true;
};