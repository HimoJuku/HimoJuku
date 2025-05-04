// db/Chapter.ts
import { Model } from '@nozbe/watermelondb';
import { field, relation, date, readonly } from '@nozbe/watermelondb/decorators';
import Book from './books';


export default class Chapter extends Model {
  static table = 'chapters';

  @field('title')   title!: string;
  @field('href')    href!: string;
  @field('order')   order!: number;
  @field('book_id') bookId!: string;

  // 外键关联到 books 表
  @relation('books', 'book_id') book!: Book;
}
