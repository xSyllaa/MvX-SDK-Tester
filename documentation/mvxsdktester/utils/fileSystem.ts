import { ParsedQuery } from '../types/parser';
import { MAX_FILE_SIZE, MAX_DIRECTORY_DEPTH, MAX_FILES, MAX_TOTAL_SIZE_BYTES } from '../config/constants';

interface FileStats {
  totalFiles: number;
  totalSize: number;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  size: number;
  children?: FileNode[];
  fileCount: number;
  dirCount: number;
  path: string;
  ignoreContent?: boolean;
  content?: string;
}

export async function isTextFile(file: File | Blob): Promise<boolean> {
  const sample = await file.slice(0, 1024).arrayBuffer();
  const bytes = new Uint8Array(sample);
  const controlChars = new Set([7, 8, 9, 10, 12, 13, 27, ...Array.from({ length: 32 }, (_, i) => i)]);
  
  return !bytes.some(byte => controlChars.has(byte) && byte < 0x20);
}

export async function readFileContent(file: File | Blob): Promise<string> {
  try {
    if (file.name.endsWith('.ipynb')) {
      return await processNotebook(file);
    }

    const text = await file.text();
    return text;
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

export function sortChildren(children: FileNode[]): FileNode[] {
  const readmeFiles = children.filter(c => c.name.toLowerCase() === 'readme.md');
  const otherFiles = children.filter(c => c.name.toLowerCase() !== 'readme.md');
  
  const regularFiles = otherFiles.filter(f => f.type === 'file' && !f.name.startsWith('.'));
  const hiddenFiles = otherFiles.filter(f => f.type === 'file' && f.name.startsWith('.'));
  const regularDirs = children.filter(d => d.type === 'directory' && !d.name.startsWith('.'));
  const hiddenDirs = children.filter(d => d.type === 'directory' && d.name.startsWith('.'));

  return [
    ...readmeFiles.sort((a, b) => a.name.localeCompare(b.name)),
    ...regularFiles.sort((a, b) => a.name.localeCompare(b.name)),
    ...hiddenFiles.sort((a, b) => a.name.localeCompare(b.name)),
    ...regularDirs.sort((a, b) => a.name.localeCompare(b.name)),
    ...hiddenDirs.sort((a, b) => a.name.localeCompare(b.name))
  ];
} 