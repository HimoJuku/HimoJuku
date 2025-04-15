// app/db/index.ts

import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import Book from './Book';
import { mySchema } from './schema';

// 建立适配器
const adapter = new LokiJSAdapter({
  schema: mySchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

// 初始化 Database
export const database = new Database({
  adapter,
  modelClasses: [Book], // 可以放更多 model
});
