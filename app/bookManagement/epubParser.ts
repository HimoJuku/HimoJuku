// app/bookManagement/epubParser.ts

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import * as FileSystem from 'expo-file-system';
import { database } from '../../db';
import Book from '../../db/book';

/**
 * ParseAndSaveEpub
 * ----------------
 * Reads a local EPUB file from the given path, parses its metadata (title, author, cover),
 * saves the cover image (if available) in the "covers" directory, and writes the book information
 * into WatermelonDB. Returns the new Book record ID.
 *
 * @param epubPath - The local file path of the EPUB (e.g. "/data/.../books/myBook.epub")
 * @returns The ID of the newly created Book record.
 */
export async function ParseAndSaveEpub(epubPath: string): Promise<string> {
  const localCoversDir = FileSystem.documentDirectory + 'covers/';
  const dirInfo = await FileSystem.getInfoAsync(localCoversDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(localCoversDir, { intermediates: true });
  }

  // Read and convert EPUB file to binary
  const base64Content = await FileSystem.readAsStringAsync(epubPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(base64Content);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }

  const zip = await JSZip.loadAsync(buf);

  // Parse META-INF/container.xml to obtain the OPF file path
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) {
    throw new Error('EPUB parse error: no META-INF/container.xml found');
  }
  const containerXmlText = await containerFile.async('text');
  const parser = new XMLParser({ ignoreAttributes: false });
  const containerObj = parser.parse(containerXmlText);

  const container = containerObj.container;
  if (!container || !container.rootFiles) {
    throw new Error('EPUB parse error: missing <container> or <rootFiles>');
  }
  let rootFile = container.rootFiles.rootFile;
  if (Array.isArray(rootFile)) {
    rootFile = rootFile[0];
  }
  if (!rootFile || !rootFile['@_full-path']) {
    throw new Error('EPUB parse error: no "@_full-path" found in rootFile');
  }
  const rootFilePath = rootFile['@_full-path'];
  const rootDir = rootFilePath.substring(0, rootFilePath.lastIndexOf('/') + 1) || '';

  // Read and parse the OPF file
  const opfFile = zip.file(rootFilePath);
  if (!opfFile) {
    throw new Error(`EPUB parse error: OPF file not found at ${rootFilePath}`);
  }
  const opfText = await opfFile.async('text');
  const opfParser = new XMLParser({ ignoreAttributes: false });
  const opfObj = opfParser.parse(opfText);

  const pack = opfObj.package;
  if (!pack || !pack.metadata) {
    throw new Error('EPUB parse error: missing <package> or <metadata> in opf');
  }
  const metadata = pack.metadata;

  const rawTitle = metadata['dc:title'];
  const title = Array.isArray(rawTitle) ? rawTitle[0] || 'Untitled'
                : typeof rawTitle === 'string' ? rawTitle : 'Untitled';

  const rawAuthor = metadata['dc:creator'];
  const author = Array.isArray(rawAuthor) ? rawAuthor[0] || 'Unknown Author'
                 : typeof rawAuthor === 'string' ? rawAuthor : 'Unknown Author';

  // Get cover ID from meta node
  let coverId = '';
  const metaNode = metadata.meta;
  if (metaNode) {
    if (Array.isArray(metaNode)) {
      const coverMeta = metaNode.find((m: any) => m['@_name'] === 'cover');
      if (coverMeta) {
        coverId = coverMeta['@_content'];
      }
    } else if (metaNode['@_name'] === 'cover') {
      coverId = metaNode['@_content'];
    }
  }

  // Retrieve cover href from manifest
  let coverHref = '';
  const manifest = pack.manifest;
  if (coverId && manifest && manifest.item) {
    let items = manifest.item;
    if (!Array.isArray(items)) {
      items = [items];
    }
    const coverItem = items.find((itm: any) => itm['@_id'] === coverId);
    coverHref = coverItem ? coverItem['@_href'] : '';
  }

  // Extract cover image and save locally (if available)
  let localCoverPath = '';
  if (coverHref) {
    const coverFileFullPath = rootDir + coverHref;
    const coverFile = zip.file(coverFileFullPath);
    if (coverFile) {
      const coverBase64 = await coverFile.async('base64');
      const now = Date.now();
      const coverExt = coverHref.split('.').pop() || 'jpg';
      localCoverPath = `${localCoversDir}cover_${now}.${coverExt}`;
      await FileSystem.writeAsStringAsync(localCoverPath, coverBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  }

  // Write parsed data into WatermelonDB
  let newBookId = '';
  await database.write(async () => {
    const newBook = await database.collections.get<Book>('books').create((book: Book) => {
      book.title = title;
      book.author = author;
      book.filePath = epubPath;
      book.coverUrl = localCoverPath || '';
      book.description = '';
      book.importedAt = Date.now();
      book.lastReadPosition = '';
    });
    newBookId = newBook.id;
  });

  console.log(` Successfully parsed and stored: ${title} by ${author}`);
  return newBookId;
}
