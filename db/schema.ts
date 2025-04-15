import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schemaVersion = 1;

export const mySchema = appSchema({
  version: schemaVersion,
  tables: [
    tableSchema({
      name: 'books', 
      columns: [
        { name: 'title', type: 'string' }, 
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
