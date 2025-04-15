import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Book extends Model {
  static table = 'books';

  @field('title')
  title!: string;

  @field('author')
  author?: string;

  @field('coverUrl')  
  coverUrl?: string;

  @field('description')
  description?: string;

  @field('filePath')  
  filePath!: string;

  @field('importedAt')
  importedAt!: number;

  @field('lastReadPosition')
  lastReadPosition!: string;
}
