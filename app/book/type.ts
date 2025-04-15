/**
 * Book interface for representing a book object.
 * It includes properties such as id, title, author, format, filePath, coverUri, importedAt, and lastReadPosition.
 * The format can be either 'epub' or 'txt'.
 * The importedAt property is a timestamp representing when the book was imported.
 * The lastReadPosition property is optional and represents the last read position in the book.
 */
export interface Book {
    id: string;
    title: string;
    author?: string;
    format: 'epub' | 'txt';
    filePath: string;
    coverUri?: string;
    importedAt: number;
    lastReadPosition?: string;
}

export interface TxtBookBase {
    srcFile: string,
    destFolder: string,
    bookTitle: string,
    destName: string
}
/**
 * Book with cover image
 */
export interface TxtBookWithCover extends TxtBookBase{
    bookCover: string
};
/**
 * Book with author information
 */
export interface TxtBookWithAuthor extends TxtBookBase  {
    bookAuthor: string
};
/**
 * Complete book with both cover and author
 */
export interface TxtBookFull extends TxtBookBase  {
    bookCover: string,
    bookAuthor: string
}
/**
 * Discriminated union of all book types
 */
export type TxtBook =
| (TxtBookBase & {type: "base"})
| (TxtBookWithCover & {type: "cover"})
| (TxtBookWithAuthor & {type: "author"})
| (TxtBookFull & {type: "full"});