import Book from "@/db/models/books";
export type SortMethod =
  | 'title'
  | 'author'
  | 'date'
  | 'lastRead'
export type SortDesc = boolean;
/**
 * Sorts an array of books by title in ascending order.
 * @param books - The array of Book type to be sorted
 * @param desc - The sorting order, either 'asc' or 'desc'
 * @returns The sorted array of books
 * @description This function sorts the books by title in ascending order using the localeCompare method.
 * @example sortByTitle(books)
 */
export function sortByTitle(books:Book[], desc:SortDesc): Book[] {
    var arrCopy = [...books];
    if (desc === true) {
        arrCopy = books.sort((a, b) => a.title.localeCompare(b.title)).reverse();
        return arrCopy;
    } else{
        arrCopy = books.sort((a, b) => a.title.localeCompare(b.title));
        return arrCopy;
    }
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
 * @param desc - The sorting order, either 'asc' or 'desc'
 * @returns The sorted array of books
 * @description This function sorts the books by author in ascending order using the localeCompare method.
 * @example sortByAuthor(books)
 */
export function sortByAuthor(books:Book[], desc:SortDesc):Book[] {
    console.log('sortByAuthor', desc);
    if(desc === true) {
        return books.sort((a, b) => a.author?.localeCompare(b.author || '') || 0).reverse();
    } 
    else {
        return books.sort((a, b) => a.author?.localeCompare(b.author || '') || 0);
    }
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
 * @param desc - The sorting order, either 'asc' or 'desc'
 * @returns The sorted array of books
 * @description This function sorts the books by date in ascending order using the importedAt field.
 * @example sortByDate(books)
 */
export function sortByDate(books:Book[], desc:SortDesc):Book[] {
    console.log('sortByDate', desc);
    if (desc === true) {
        return books.sort((a, b) => b.importedAt - a.importedAt).reverse();
    } 
    else {
    return books.sort((a, b) => a.importedAt - b.importedAt);
    }
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
 * @param desc - The sorting order, either 'asc' or 'desc'
 * @returns The sorted array of books
 * @description This function sorts the books by last read position in ascending order using the lastReadPosition field.
 * @example sortByLastRead(books)
 */
export function sortByLastRead(books:Book[], desc:SortDesc):Book[] {
    console.log('sortByLastRead', desc);
    if (desc === true) {
        return books.sort((a, b) => a.lastReadPosition?.localeCompare(b.lastReadPosition || '') || 0).reverse();
    }
    else {
        return books.sort((a, b) => a.lastReadPosition?.localeCompare(b.lastReadPosition || '') || 0);
    }
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

/**
 * Sorts books using specified method while maintaining immutability
 * @param books Array of books to sort
 * @param method One of: 'title', 'titleDesc', 'author', 'authorDesc', 
 *               'date', 'dateDesc', 'lastRead', 'lastReadDesc'
 * @param desc Sorting order, either 'asc' or 'desc'
 * @returns New sorted array of books
 * @example 
 * // Sort by title ascending
 * sortBooks(books, 'title')
 * 
 * // Sort by author descending
 * sortBooks(books, 'authorDesc')
 */
export function sortBooks(books: Book[], method: SortMethod, desc: SortDesc): Book[] {
  const arrCopy = [...books];
  const sorters: Record<SortMethod, (books: Book[], desc: SortDesc) => Book[]> = {
    'title': sortByTitle,
    'author': sortByAuthor,
    'date': sortByDate,
    'lastRead': sortByLastRead,
  };
  return sorters[method](arrCopy, desc);
}