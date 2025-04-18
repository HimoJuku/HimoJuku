import {TxtBook,TxtBookWithCover, TxtBookWithAuthor, TxtBookFull,Chapter} from './type';
import EpubBuilder, { EpubSettings } from '@cd-z/react-native-epub-creator';

/**
 * Convert txt book to epub
 * After conversion, the epub file will be saved under the destination folder with destName that you set.
 * @param txtBook check the TxtBook type.
 * @param apiKey the key for AI processing, if you want to use AI to extract chapter information, please set it.
 */
export default async function ConvertToEpub(txtBook: TxtBook, apiKey?: string)
{
    let settings: EpubSettings;
    switch (txtBook.type){
        case "base":{
            const { bookTitle, destName, language} = txtBook;
            settings = {
                title: bookTitle,
                fileName: destName,
                language: language,
            }
            break;
        }
        case "cover":{
            const { bookTitle, destName, language, bookCover} = txtBook as TxtBookWithCover;
            settings = {
                title: bookTitle,
                fileName: destName,
                language: language,
                cover: bookCover
            }
            break;
        }
        case "author":{
            const { bookTitle, language, destName, bookAuthor} = txtBook as TxtBookWithAuthor;
            settings = {
                title: bookTitle,
                fileName: destName,
                language: language,
                author: bookAuthor
            }
            break;
        }
        case "full":{
            const { bookTitle, language, destName, bookCover, bookAuthor} = txtBook as TxtBookFull;
            settings = {
                    title: bookTitle,
                    fileName: destName,
                    language: language,
                    cover: bookCover,
                    author: bookAuthor
                }
            break;
        }
    }
    let chapters: Chapter[] = [];
    const { content,destFolder } = txtBook;
    // Check if the apiKey is set, if not, use the default regex to extract chapter information
    if (apiKey === undefined){
        // If the key is not set, use the default regex to extract chapter information
        chapters = FormatChapterByRegex(content);
    }
    else{
        // If the key is set, use AI to extract chapter information
        chapters = await FormatChapterByAI(content, apiKey);
    }

    var epub = new EpubBuilder({
        ...settings,
        description: ExtractDescriptionByRegex(txtBook.content),
        stylesheet: {
            p: {
                width: "100%"
            }
        },
        chapters: chapters.map((chapter) => {
            return {
                title: chapter.title,
                htmlBody: chapter.content,
            }
        })},
        destFolder);
        if (chapters.length === 0) {
            console.log("No chapters found, please check the content of the book.")
        }
        else{
            try{
                await epub
                    .save()
                    .then((value: string) => console.log(value))
            }catch(error){
            // remove the temp created folder
            await epub.discardChanges();
            }
        }
}

function ExtractDescriptionByRegex(content: string): string{
    const lines = content.split('\n');
    const description: string[] = [];
    const descriptionRegex = /简介：\s*([\s\S]*?)(?=\n{2,}第|\Z)/;
    for (const line of lines) {
        const match = line.match(descriptionRegex);
        if (match) {
            description.push(match[1].trim());
        }
    }
    return description.join('\n');
}

/**
 * Format the chapter information by regex
 * @param content the content of the book
 * @param chapterRegex the regex to match the chapter information, if not set, use the default regex.
 * The default regex is /第[\u4e00-\u9fa5]+章\s*"([^"]+)"/
 * @returns the chapter information, including title and content
 * @example
 * const content = "第1章 \"第一章\"\n这是第一章的内容\n第2章 \"第二章\"\n这是第二章的内容";
 * @returns [
 *  {
 *      title: "第一章",
 *      content: "这是第一章的内容"
 *  },]
 */
function FormatChapterByRegex(content: string, chapterRegex?:RegExp): Chapter[] {
    const lines = content.split('\n');
    const chapters: Chapter[] = [];
    chapterRegex = chapterRegex || /第[\u4e00-\u9fa5]+章\s*"([^"]+)"/;
    let currentChapter: Chapter | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
        const match = line.match(chapterRegex);

        if (match) {
            // If we have collected content for a previous chapter, save it
            if (currentChapter) {
                currentChapter.content = '<p>' + currentContent.join('\n') + '</p>';
            }

            // Start a new chapter
            currentChapter = {
                title: match[1],
                content: ''
            };
            currentContent = [line]; // Include the chapter header in the content
        } else if (currentChapter) {
            // Add the line to the current chapter's content
            currentContent.push('<p>'+line+'</p>');
        }
    }

    // Don't forget the last chapter
    if (currentChapter) {
        currentChapter.content = currentContent.join('\n');
        chapters.push(currentChapter);
    }

    return chapters;
}

async function FormatChapterByAI(content: string, key: string): Promise<Chapter[]> {
    const sample = content.slice(0, 1000)// Sample the first 1000 words for AI processing
    const prompt = `你是一个正则表达式语言专家，请根据以下内容，提供一个用于匹配章节的正则表达式，仅需要回复表达式：\n\n${sample}`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer '+ key,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-r1',
            messages: [
                {
                role: 'user',
                content: prompt,
                }]})});
    const responseText = await response.text();
    console.log(responseText);
    const responseJson = await response.json();
    console.log(responseJson);
    console.log(response.status)
    if (response.status === 200) {
        const data = await response.json();
        const regex = data.choices[0].message.content.trim();
        const chapterRegex = new RegExp(regex, 'g');
        return FormatChapterByRegex(content, chapterRegex);
    }
    else {
        console.error('Error fetching AI response:', response.statusText);
        return FormatChapterByRegex(content); // Fallback to default regex if AI fails
    }
}