import { appSchema, tableSchema } from '@nozbe/watermelondb';

// 版本号每次修改 schema 都要递增
export const schemaVersion = 1;

export const mySchema = appSchema({
  version: schemaVersion,
  tables: [
    tableSchema({
      name: 'books',    // 数据表: 'books'
      columns: [
        // 字段
        { name: 'title', type: 'string' },       // 必填
        { name: 'author', type: 'string', isOptional: true },
        { name: 'filePath', type: 'string'},   
        { name: 'coverUrl', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'importedAt', type:'number'}, 
        { name: 'lastReadPosition', type:'string', isOptional: true}, 
      ],
    }),
    
  ],
});
