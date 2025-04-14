/**
 * Book interface
 * @param id unique identifier (e.g. UUID)
 * @param title book title
 * @param author author
 * @param format file format
 * @param filePath file path in local storage, e.g. "/books/xxxx.epub"
 * @param coverUri cover image path
 * @param importedAt import time, timestamp
 * @param lastReadPosition last read position
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