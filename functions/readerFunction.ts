import {
    useRouter
} from 'expo-router';

/**
 * openReader
 * ----------
 * Navigates to the reader page with the given path and book ID as parameters.
 *
 * @param path - The local file path of the book (e.g. "/data/.../books/myBook.epub")
 * @param bookId - The unique identifier of the book
 */
export function openReader(path: string, bookId: string):boolean{
    const router = useRouter();
    router.push({
        pathname: '/reader',
        params: {
        path,
        bookId,
        },
    });
    return true;
};