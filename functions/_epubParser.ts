import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import * as FileSystem from 'expo-file-system';
import { database } from '@/db';
import Book from '@/db/models/books';
import Chapter from '@/db/models/Chapter'

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
  if (!container || !container.rootfiles) {
    throw new Error('EPUB parse error: missing <container> or <rootfiles>');
  }
  let rootfile = container.rootfiles.rootfile;
  if (Array.isArray(rootfile)) {
    rootfile = rootfile[0];
  }
  if (!rootfile || !rootfile['@_full-path']) {
    throw new Error('EPUB parse error: no "@_full-path" found in rootfile');
  }
  const rootfilePath = rootfile['@_full-path'];
  const rootDir = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) || '';

  // Read and parse the OPF file
  const opfFile = zip.file(rootfilePath);
  if (!opfFile) {
    throw new Error(`EPUB parse error: OPF file not found at ${rootfilePath}`);
  }
  const opfText = await opfFile.async('text');
  const opfParser = new XMLParser({
    ignoreAttributes:    false,
    removeNSPrefix:     true,
    attributeNamePrefix: '@_',
  });
  const opfObj = opfParser.parse(opfText);
  
  // Check for the package element in the OPF file
  const pack = opfObj.package;
  if (!pack) {
    throw new Error('EPUB parse error: missing <package> in opf');
  }
  // Check for the metadata element in the package
  const metadata = pack.metadata;
  if (!metadata) {
    throw new Error('EPUB parse error: missing <metadata> in opf');
  }

  /**
   * Extracts text from a node, handling various formats (string, array, object).
   * @param node - The node to extract text from.
   * @returns The extracted text.
   */
  function extractText(node: any): string {
    if (typeof node === 'string') {
      return node;
    }
    if (Array.isArray(node)) {
      return extractText(node[0]);
    }
    if (node && typeof node === 'object') {
      if (typeof node['#text'] === 'string') {
        return node['#text'];
      }
      for (const key of Object.keys(node)) {
        if (typeof node[key] === 'string') {
          return node[key];
        }
      }
    }
    return '';
  }

  // Extract title and author from metadata
  const rawTitleNode  = metadata['dc:title']  || metadata.title;
  const rawAuthorNode = metadata['dc:creator'] || metadata.creator;

  // Handle both string and array formats
  const title  = extractText(rawTitleNode)  || 'Untitled';
  const author = extractText(rawAuthorNode) || 'Unknown Author';

  // Extract cover ID from metadata
  let coverId = '';
  const metaNodes: any[] = Array.isArray(metadata.meta)
    ? metadata.meta
    : metadata.meta
      ? [metadata.meta]
      : [];
  const coverMeta = metaNodes.find((m) => m['@_name'] === 'cover');
  if (coverMeta) {
    coverId = coverMeta['@_content'];
  }

  // If no cover ID is found, use the first image file as the cover
  let coverHref = '';
  const manifest = pack.manifest;
  if (manifest) {
    const items = Array.isArray(manifest.item)
      ? manifest.item
      : manifest.item
        ? [manifest.item]
        : [];

    // Check if coverId is a valid ID or href
    const coverItem = items.find(
      (itm: any) =>
        itm['@_id'] === coverId ||
        itm['@_href'] === coverId ||
        itm['@_properties']?.includes('cover')
    );

    if (coverItem) {
      coverHref = coverItem['@_href'] || '';
    }
  }

  // If no coverHref is found, use the first image file as the cover
  let localCoverPath = '';
  if (coverHref) {
    const coverFileFullPath = rootDir + coverHref;
    const coverFile = zip.file(coverFileFullPath);
    if (coverFile) {
      const coverBase64 = await coverFile.async('base64');
      const ext = coverHref.split('.').pop() || 'jpg';
      const now = Date.now();
      localCoverPath = `${localCoversDir}cover_${now}.${ext}`;
      await FileSystem.writeAsStringAsync(localCoverPath, coverBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  }

  // Write parsed data into WatermelonDB
  let newBookId = '';
  await database.write(async () => {
    // Create a new book record in the database
    const newBook = await database.collections
      .get<Book>('books')
      .create((book) => {
        book.title = title;
        book.author = author;
        book.filePath = epubPath;
        book.coverUrl = localCoverPath || '';
        book.description = '';
        book.importedAt = Date.now();
        book.lastReadPosition = '';
      });

    newBookId = newBook.id;

    // Create a new chapter record for the book
    const manifestItems = Array.isArray(pack.manifest.item)
    ? pack.manifest.item
    : [pack.manifest.item];

    // Find the first item with a media type of "application/xhtml+xml"
    let navItem: any =
      // EPUB3 nav.xhtml
      manifestItems.find((it: any) =>
        it['@_properties']?.split(' ').includes('nav')
      ) ||
      // EPUB2 toc.ncx
      manifestItems.find(
        (it: any) => it['@_media-type'] === 'application/x-dtbncx+xml'
      ) ||
      // includes nav.xhtml or toc.xhtml
      manifestItems.find((it: any) =>
        /(nav|toc)\.(xhtml|xml|ncx)$/i.test(it['@_href'])
      );

    if (navItem) {
      const navPath = rootDir + navItem['@_href'];
      const navFile = zip.file(navPath);
      if (navFile) {
        const text = await navFile.async('text');
        const isNCX =
          navItem['@_media-type'] === 'application/x-dtbncx+xml';

        if (isNCX) {
          /* ---------- EPUB2 (.ncx) ---------- */
          const ncxObj = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
          }).parse(text);
          const navPoints = ncxObj?.ncx?.navMap?.navPoint ?? [];
          const points = Array.isArray(navPoints) ? navPoints : [navPoints];

          let order = 0;
          for (const p of points) {
            const label = p.navLabel.text;
            const src  = p.content['@_src'];
            if (!src) continue;

            // If src is a relative path, prepend the rootDir
            const fullHref = (rootDir + src)
              .replace(/\.htm\.html$/i, '.htm')
              .replace(/\.html\.html$/i, '.html');
            await database.collections
              .get<Chapter>('chapters')
              .create((ch) => {
                ch.bookId = newBookId;
                ch.title   = String(label).trim();
                ch.href    = fullHref;
                ch.order   = order++;
              });
          }
        } else {
          /* ---------- EPUB3 (<nav> in .xhtml) ---------- */
          const navObj = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
          }).parse(text);

          const liNodes = navObj?.html?.body?.nav?.ol?.li ?? [];
          const entries = Array.isArray(liNodes) ? liNodes : [liNodes];

          let order = 0;
          for (const li of entries) {
            const anchor = li.a;
            if (!anchor || !anchor['@_href']) continue;

            const titleText =
              typeof anchor['#text'] === 'string'
                ? anchor['#text']
                : Array.isArray(anchor['#text'])
                ? anchor['#text'][0]
                : '';

            const relativeHref = anchor['@_href'];
            const fullHref = (rootDir + relativeHref)
              .replace(/\.htm\.html$/i, '.htm')
              .replace(/\.html\.html$/i, '.html');

            await database.collections
              .get<Chapter>('chapters')
              .create((ch) => {
                ch.bookId = newBookId;
                ch.title   = String(titleText).trim();
                ch.href    = fullHref;
                ch.order   = order++;
              });
          }
        }
      }
    }
    });

  console.log(` Successfully parsed and stored: ${title} by ${author}`);
  return newBookId;
}