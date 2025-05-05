import Book from "@/db/models/books";

export type  SortIndex =
    | 'title'   
    | 'author'  
    | 'date'    
    | 'lastRead';

export type SortMethod = {
    method: SortIndex;
    desc: boolean
}

/**
 * Sorts an array of books by title in ascending order.
 * @param books - The array of Book type to be sorted
 * @param desc - The sorting order, either 'asc' or 'desc'
 * @returns The sorted array of books
 * @description This function sorts the books by title in ascending order using the localeCompare method.
 * @example sortByTitle(books)
 */
export function sortByTitle(books:Book[], desc:boolean): Book[] {
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
export function sortByAuthor(books:Book[], desc:boolean):Book[] {
    console.log('sortByAuthor', desc);
    if(desc === true) {
        return books.sort((a, b) => b.author?.localeCompare(a.author || '') || 0);
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
export function sortByDate(books:Book[], desc:boolean):Book[] {
    console.log('sortByDate', desc);
    if (desc === true) {
        console.log('sortByDate desc');
        return books.sort((a, b) => b.importedAt - a.importedAt);
    } 
    else {
        console.log('sortByDate asc');
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
export function sortByLastRead(books:Book[], desc:boolean):Book[] {
    console.log('sortByLastRead', desc);
    if (desc === true) {
        console.log('sortByLastRead desc');
        return books.sort((a, b) => b.lastReadPosition?.localeCompare(a.lastReadPosition || '') || 0);
    }
    else {
        console.log('sortByLastRead asc');
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
export function sortBooks(books: Book[], method: SortMethod): Book[] {
  const arrCopy = [...books];
  const sorters: Record<string, (books: Book[], desc: boolean) => Book[]> = {
    'title': sortByTitle,
    'author': sortByAuthor,
    'date': sortByDate,
    'lastRead': sortByLastRead,
  };
  return sorters[method.method](arrCopy, method.desc);
}