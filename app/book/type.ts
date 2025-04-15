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