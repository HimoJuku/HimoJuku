
export type Chapter = {
    title: string,
    content: string,
}
export interface TxtBookBase {
    content: string,
    destFolder: string,
    bookTitle: string,
    destName: string,
    language: "cn" | "en" | "jp"
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