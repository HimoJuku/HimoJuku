import { generate } from 'txt2epub';
import {TxtBook,TxtBookWithCover, TxtBookWithAuthor, TxtBookFull} from './type';

/**
 * Convert txt book to epub
 * After conversion, the epub file will be saved under the destination folder with destName that you set.
 * @param txtBook check the TxtBook type.
 */
export default function convertToEpub(txtBook: TxtBook)
{
    switch (txtBook.type){
        case "base":{
            const { srcFile, destFolder, bookTitle, destName } = txtBook;
            generate({
                sourceFile : srcFile,
                outputDir : destFolder,
                title : bookTitle,
                outputName : destName
            });
            break;
        }
        case "cover":{
            const { srcFile, destFolder, bookTitle, destName, bookCover} = txtBook as TxtBookWithCover;
            generate({
                sourceFile : srcFile,
                outputDir : destFolder,
                title : bookTitle,
                outputName : destName,
                coverPath : bookCover
            });
            break;
        }
        case "author":{
            const { srcFile, destFolder, bookTitle, destName, bookAuthor} = txtBook as TxtBookWithAuthor;
            generate({
                sourceFile : srcFile,
                outputDir : destFolder,
                title : bookTitle,
                outputName : destName,
                author : bookAuthor
            });
            break;
        }
        case "full":{
            const { srcFile, destFolder, bookTitle, destName, bookCover, bookAuthor} = txtBook as TxtBookFull;
            generate({
                sourceFile : srcFile,
                outputDir : destFolder,
                title : bookTitle,
                outputName : destName,
                coverPath : bookCover,
                author : bookAuthor
            });
            break;
        }
    }
}