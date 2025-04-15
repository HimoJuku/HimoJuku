// app/bookManagement/epubParser.ts

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import * as FileSystem from 'expo-file-system';
import { database } from '../../db'; // db 文件夹与 app 平级
import Book from '../../db/Book';    // WatermelonDB Book model

/**
 * parseAndSaveEpub
 * ----------------
 * 1) 将传入的 epubPath 做进一步解析（假定已复制到 documentDirectory + 'books/'）
 * 2) 解析 metadata：title, author, coverHref
 * 3) 若有封面图片，写到 localCoversDir
 * 4) 将信息写入 WatermelonDB 并返回新建 Book id
 * 
 * @param epubPath e.g. "/data/user/0/host.exp.exponent/files/books/myBook.epub"
 * @returns newBookId (Book.id) 或抛错
 */
export async function parseAndSaveEpub(epubPath: string): Promise<string> {
  // 准备封面存放目录
  const localCoversDir = FileSystem.documentDirectory + 'covers/';
  const dirInfo = await FileSystem.getInfoAsync(localCoversDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(localCoversDir, { intermediates: true });
  }

  // 1) 读取 epub 文件 => base64 => Uint8Array
  const base64Content = await FileSystem.readAsStringAsync(epubPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(base64Content);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }

  // 2) 用 JSZip 解压
  const zip = await JSZip.loadAsync(buf);

  // 3) 读取 container.xml
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) {
    throw new Error('EPUB parse error: no META-INF/container.xml found');
  }
  const containerXmlText = await containerFile.async('text');

  // 创建 parser，确保保留XML属性
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  const containerObj = parser.parse(containerXmlText);

  // 获取 rootfile path
  const container = containerObj.container;
  if (!container) {
    throw new Error('EPUB parse error: <container> node missing');
  }
  const rootfiles = container.rootfiles;
  if (!rootfiles) {
    throw new Error('EPUB parse error: <rootfiles> node missing');
  }
  let rootfile: any = rootfiles.rootfile;
  if (Array.isArray(rootfile)) {
    rootfile = rootfile[0];
  }
  if (!rootfile) {
    throw new Error('EPUB parse error: no <rootfile> found');
  }
  const rootfilePath = rootfile['@_full-path'];
  if (!rootfilePath) {
    throw new Error('EPUB parse error: no "@_full-path" in rootfile');
  }

  // e.g. "OEBPS/content.opf"
  const rootDir = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) || '';

  // 4) 读取 .opf
  const opfFile = zip.file(rootfilePath);
  if (!opfFile) {
    throw new Error(`EPUB parse error: OPF file not found at ${rootfilePath}`);
  }
  const opfText = await opfFile.async('text');

  // 用 fast-xml-parser 解析 opf
  const opfParser = new XMLParser({
    ignoreAttributes: false,
  });
  const opfObj = opfParser.parse(opfText);

  // 5) 提取 title, author, coverId
  const pack = opfObj.package;
  if (!pack) {
    throw new Error('EPUB parse error: no <package> node in opf');
  }
  const metadata = pack.metadata;
  if (!metadata) {
    throw new Error('EPUB parse error: no <metadata> node in opf');
  }

  // title
  const rawTitle = metadata['dc:title'];
  let title = '';
  if (Array.isArray(rawTitle)) {
    title = rawTitle[0] || 'Untitled';
  } else if (typeof rawTitle === 'string') {
    title = rawTitle;
  } else {
    title = 'Untitled';
  }

  // author
  const rawAuthor = metadata['dc:creator'];
  let author = '';
  if (Array.isArray(rawAuthor)) {
    author = rawAuthor[0] || 'Unknown Author';
  } else if (typeof rawAuthor === 'string') {
    author = rawAuthor;
  } else {
    author = 'Unknown Author';
  }

  // cover ID
  let coverId = '';
  const metaNode = metadata.meta;
  if (metaNode) {
    if (Array.isArray(metaNode)) {
      const coverMeta = metaNode.find((m: any) => m['@_name'] === 'cover');
      if (coverMeta) {
        coverId = coverMeta['@_content'];
      }
    } else {
      if (metaNode['@_name'] === 'cover') {
        coverId = metaNode['@_content'];
      }
    }
  }

  // 找 coverHref
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

  // 6) 提取封面文件
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

  // 7) 写入 WatermelonDB
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

  console.log(` 成功解析并存储：${title} by ${author}`);
  return newBookId;
}
