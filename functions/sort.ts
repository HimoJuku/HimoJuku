import { Book } from "@/constants/books";
/**
 * Sorts an array of books by title in ascending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by title in ascending order using the localeCompare method.
 * @example sortByTitle(books)
 */
export function sortByTitle(books:Book[]): Book[] {
    return books.sort((a, b) => a.title.localeCompare(b.title));
}
/**
 * Sorts an array of books by title in descending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by title in descending order using the localeCompare method.
 * @example sortByTitleDesc(books)
 */
export function sortByTitleDesc(books:Book[]): Book[] {
    return books.sort((a, b) => a.title.localeCompare(b.title)).reverse();
}
/**
 * Sorts an array of books by author in ascending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by author in ascending order using the localeCompare method.
 * @example sortByAuthor(books)
 */
export function sortByAuthor(books:Book[]):Book[] {
    return books.sort((a, b) => a.author?.localeCompare(b.author || '') || 0);
}
/**
 * Sorts an array of books by author in descending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by author in descending order using the localeCompare method.
 * @example sortByAuthorDesc(books)
 */
export function sortByAuthorDesc(books:Book[]):Book[] {
    return books.sort((a, b) => a.author?.localeCompare(b.author || '') || 0).reverse();
}
/**
 * Sorts an array of books by date in ascending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by date in ascending order using the importedAt field.
 * @example sortByDate(books)
 */
export function sortByDate(books:Book[]):Book[] {
    return books.sort((a, b) => a.importedAt - b.importedAt);
}
/**
 * Sorts an array of books by date in descending order.
 * @param books - The array of books to be sorted
 * @description This function sorts the books by date in descending order using the importedAt field.
 * @example sortByDateDesc(books)
 * @returns The sorted array of books
 */
export function sortByDateDesc(books:Book[]):Book[] {
    return books.sort((a, b) => a.importedAt - b.importedAt).reverse();
}
/**
 * Sorts an array of books by last read position in ascending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by last read position in ascending order using the lastReadPosition field.
 * @example sortByLastRead(books)
 */
export function sortByLastRead(books:Book[]):Book[] {
    return books.sort((a, b) => a.lastReadPosition?.localeCompare(b.lastReadPosition || '') || 0);
}
/**
 * Sorts an array of books by last read position in descending order.
 * @param books - The array of books to be sorted
 * @returns The sorted array of books
 * @description This function sorts the books by last read position in descending order using the lastReadPosition field.
 * @example sortByLastReadDesc(books)
 */
export function sortByLastReadDesc(books:Book[]):Book[] {
    return books.sort((a, b) => a.lastReadPosition?.localeCompare(b.lastReadPosition || '') || 0).reverse();
}