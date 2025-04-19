export interface Book {
    // 数据库 ID
    bookId: string
    // 用户可见标题
    title: string;  
    // 作者
    author?: string;    
    // epub 文件在本地的实际路径
    filePath: string;      
    // 封面图片本地路径 or url
    coverUri?: string; 
    // 简介
    description?: string; 
    // 时间戳
    importedAt: number;    
    // 阅读进度
    lastReadPosition?: string;
  }
  