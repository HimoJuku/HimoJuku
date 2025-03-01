export type Cover = {
    imageUrl: string;
}

export type RawBook = {
    name: string;
    description: string;
    author: string;
    content: string;
}

export type Book = RawBook & {
    bookId: number;
    cover: Cover;
}