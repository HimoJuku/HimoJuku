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
    // 创建书籍
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

    // 尝试解析 nav 目录并存入 chapters 表
const manifestItems = Array.isArray(pack.manifest.item)
  ? pack.manifest.item
  : [pack.manifest.item];

// 2. 多策略定位导航文件
let navItem: any =
  // EPUB3 nav.xhtml
  manifestItems.find((it: any) =>
    it['@_properties']?.split(' ').includes('nav')
  ) ||
  // EPUB2 toc.ncx
  manifestItems.find((it: any) =>
    it['@_media-type'] === 'application/x-dtbncx+xml'
  ) ||
  // 最后兜底：id 或 href 含 toc 或 nav
  manifestItems.find((it: any) =>
    /(nav|toc)\.(xhtml|xml|ncx)$/.test(it['@_href'])
  );

if (navItem && navItem['@_href']) {
  const navPath = rootDir + navItem['@_href'];
  const navFile = zip.file(navPath);

  if (navFile) {
    const text = await navFile.async('text');

    if (navItem['@_media-type'] === 'application/x-dtbncx+xml') {
      // —— EPUB2 .ncx 解析 ——  
      const ncxParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const ncxObj = ncxParser.parse(text);
      const navPoints = ncxObj.ncx.navMap.navPoint;
      const points = Array.isArray(navPoints) ? navPoints : [navPoints];

      let order = 0;
      for (const pt of points) {
        const label = pt.navLabel.text;
        const contentSrc = pt.content['@_src'];
        await database.collections.get<Chapter>('chapters').create((ch: any) => {
          ch.title = String(label).trim();
          ch.href  = contentSrc;
          ch.order = order++;
          ch._raw.book_id = newBook.id;
        });
      }
    } else {
      // —— EPUB3 .xhtml nav 解析 ——  
      const navParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const navObj = navParser.parse(text);
      // 取出 <nav> → <ol> → <li>
      const navList = navObj.html.body.nav.ol.li;
      const entries = Array.isArray(navList) ? navList : [navList];

      let order = 0;
      for (const entry of entries) {
        const a = entry.a;
        if (!a || !a['@_href']) continue;
        const titleText = typeof a['#text'] === 'string'
          ? a['#text']
          : Array.isArray(a['#text'])
          ? a['#text'][0]
          : '';
        const href = a['@_href'];

        await database.collections.get<Chapter>('chapters').create((ch: any) => {
          ch.title = titleText.trim();
          ch.href  = href;
          ch.order = order++;
          ch._raw.book_id = newBook.id;
        });
      }
    }
  }
}
  });

  console.log(` Successfully parsed and stored: ${title} by ${author}`);
  return newBookId;
}