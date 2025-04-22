import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import Book from '@/db/models/books';
import Settings from '@/db/models/settings';
import { mySchema } from '@/db/schema';
import Chapter from '@/db/models/Chapter'

const adapter = new LokiJSAdapter({
  schema: mySchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

export const database = new Database({
  adapter,
  modelClasses: [Book, Settings, Chapter],
});
