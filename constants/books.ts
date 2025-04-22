/**
 * @description: This file contains the types and constants used for managing books in the application.
 * It includes the Book interface, which defines the structure of a book object, and the DrawerParamList type,
 * which defines the navigation parameters for the drawer navigation.
 */
export type book = {
  bookId: string
  title: string;
  author?: string;
  filePath: string;
  coverUri?: string;
  description?: string;
  importedAt: number;
  lastReadPosition?: string;
  }
