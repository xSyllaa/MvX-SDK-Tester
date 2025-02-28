import { ParsedQuery } from '../types/parser';
import { isTextFile, readFileContent, sortChildren } from './fileSystem';
import { isIncluded, isExcluded } from './patterns';
import { FileNode, FileStats, MAX_DIRECTORY_DEPTH, MAX_FILES } from '../types/fileSystem';

export async function ingestDirectory(
  path: string, 
  query: ParsedQuery,
  stats: FileStats = { totalFiles: 0, totalSize: 0 },
  depth: number = 0
): Promise<FileNode | null> {
  if (depth > MAX_DIRECTORY_DEPTH) {
    console.warn(`Skipping deep directory: ${path} (max depth ${MAX_DIRECTORY_DEPTH} reached)`);
    return null;
  }

  if (stats.totalFiles >= MAX_FILES) {
    console.warn(`Maximum file limit (${MAX_FILES}) reached`);
    return null;
  }

  const result: FileNode = {
    name: path.split('/').pop() || '',
    type: 'directory',
    size: 0,
    children: [],
    fileCount: 0,
    dirCount: 0,
    path: path,
    ignoreContent: false
  };

  try {
    const directoryHandle = await window.navigator.storage.getDirectory();
    
    // @ts-ignore - FileSystemDirectoryHandle.entries() n'est pas reconnu par TypeScript
    for await (const [name, entry] of directoryHandle.entries()) {
      await processFileSystemEntry(entry, query, result, stats, depth);
    }
    
    if (result.children) {
      result.children = sortChildren(result.children);
    }
    
    return result;
  } catch (error) {
    console.error('Error scanning directory:', error);
    return null;
  }
}

export async function ingestSingleFile(
  file: File,
  query: ParsedQuery
): Promise<{ summary: string; tree: string; content: string }> {
  if (!await isTextFile(file)) {
    throw new Error('Not a text file');
  }

  const content = await readFileContent(file);
  const size = file.size;

  const summary = `File: ${file.name}
Size: ${size.toLocaleString()} bytes
Lines: ${content.split('\n').length}
Estimated tokens: ${estimateTokens(content)}`;

  const tree = `Directory structure:
└── ${file.name}`;

  return {
    summary,
    tree,
    content: size > query.maxFileSize ? '[Content ignored: file too large]' : content
  };
}

export function createSummaryString(query: ParsedQuery, node: FileNode): string {
  let summary = '';
  
  if (query.userName) {
    summary += `Repository: ${query.userName}/${query.repoName}\n`;
  } else {
    summary += `Repository: ${query.slug}\n`;
  }

  summary += `Files analyzed: ${node.fileCount}\n`;

  if (query.subpath !== '/') {
    summary += `Subpath: ${query.subpath}\n`;
  }
  
  if (query.commit) {
    summary += `Commit: ${query.commit}\n`;
  } else if (query.branch && !['main', 'master'].includes(query.branch)) {
    summary += `Branch: ${query.branch}\n`;
  }

  const tokens = estimateTokens(createFileContentString(extractFilesContent(query, node)));
  if (tokens) {
    summary += `\nEstimated tokens: ${tokens}`;
  }

  return summary;
}

export function createTreeStructure(
  query: ParsedQuery,
  node: FileNode,
  prefix: string = '',
  isLast: boolean = true
): string {
  let tree = '';

  if (!node.name) {
    node.name = query.slug;
  }

  if (node.name) {
    const currentPrefix = isLast ? '└── ' : '├── ';
    const name = node.type === 'directory' ? `${node.name}/` : node.name;
    tree += prefix + currentPrefix + name + '\n';
  }

  if (node.type === 'directory' && node.children) {
    const newPrefix = node.name ? prefix + (isLast ? '    ' : '│   ') : prefix;
    node.children.forEach((child, index) => {
      tree += createTreeStructure(
        query,
        child,
        newPrefix,
        index === node.children!.length - 1
      );
    });
  }

  return tree;
}

async function processFileSystemEntry(
  entry: any,
  query: ParsedQuery, 
  parent: FileNode, 
  stats: FileStats, 
  depth: number
): Promise<void> {
  const isDirectory = entry.kind === 'directory';
  
  if (isDirectory) {
    const childNode = await ingestDirectory(entry.name, query, stats, depth + 1);
    if (childNode) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(childNode);
      parent.dirCount++;
    }
  } else {
    if (isIncluded(entry.name) && !isExcluded(entry.name)) {
      stats.totalFiles++;
      parent.fileCount++;
    }
  }
}

function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

function createFileContentString(filesContent: Record<string, string>): string {
  return Object.entries(filesContent)
    .map(([path, content]) => `File: ${path}\n\n${content}`)
    .join('\n\n');
}

function extractFilesContent(query: ParsedQuery, node: FileNode): Record<string, string> {
  const result: Record<string, string> = {};
  
  function traverse(fileNode: FileNode) {
    if (fileNode.type === 'file' && fileNode.content) {
      result[fileNode.path] = fileNode.content;
    } else if (fileNode.type === 'directory' && fileNode.children) {
      fileNode.children.forEach(traverse);
    }
  }
  
  traverse(node);
  return result;
} 