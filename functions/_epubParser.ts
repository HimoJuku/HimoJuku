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
    removeNSPrefix:     true,   // ← 忽略掉所有前缀（如 opf:、dc:）
    attributeNamePrefix: '@_',
  });
  const opfObj = opfParser.parse(opfText);
  
  // --- 从根对象拿到 package 节点 ---
  const pack = opfObj.package;
  if (!pack) {
    throw new Error('EPUB parse error: missing <package> in opf');
  }
  
  // --- metadata 节点，现在不管它原来是 opf:metadata 还是 metadata，都能拿到 ---
  const metadata = pack.metadata;
  if (!metadata) {
    throw new Error('EPUB parse error: missing <metadata> in opf');
  }
  
  // --- 1) 取标题 & 作者 ---
// --- 在文件顶部或函数顶部添加 ---
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

// --- 在解析完 metadata 之后，替换原有 title/author 提取处 ---
const rawTitleNode  = metadata['dc:title']  || metadata.title;
const rawAuthorNode = metadata['dc:creator'] || metadata.creator;

const title  = extractText(rawTitleNode)  || 'Untitled';
const author = extractText(rawAuthorNode) || 'Unknown Author';

  
  // --- 2) 找 coverId（兼容 <meta name="cover" content="...">） ---
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
  
  // --- 3) 从 manifest 中找封面 href ---
  let coverHref = '';
  const manifest = pack.manifest;
  if (manifest) {
    const items = Array.isArray(manifest.item)
      ? manifest.item
      : manifest.item
        ? [manifest.item]
        : [];
  
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
  
  // --- 4) 保存封面（不变） ---
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
  
  /** 找到 toc/nav 文件 */
  let navItem: any =
    // EPUB3 nav.xhtml
    manifestItems.find((it: any) =>
      it['@_properties']?.split(' ').includes('nav')
    ) ||
    // EPUB2 toc.ncx
    manifestItems.find(
      (it: any) => it['@_media-type'] === 'application/x-dtbncx+xml'
    ) ||
    // 兜底：文件名包含 nav/toc
    manifestItems.find((it: any) =>
      /(nav|toc)\.(xhtml|xml|ncx)$/i.test(it['@_href'])
    );
  
  if (navItem) {
    const navPath = rootDir + navItem['@_href']; // 带目录前缀
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
          const src  = p.content['@_src']; // 可能含锚点
          if (!src) continue;
  
          const fullHref = (rootDir + src)
            // 修正重复扩展名
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
  
          const relativeHref = anchor['@_href']; // 可能带 # 锚点
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