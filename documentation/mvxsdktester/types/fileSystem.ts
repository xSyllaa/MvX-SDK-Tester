export interface FileStats {
  totalFiles: number;
  totalSize: number;
}

export interface FileNode {
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

export interface FileContent {
  path: string;
  content: string | null;
  size: number;
}

// Ajout des constantes de configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DIRECTORY_DEPTH = 10;
export const MAX_FILES = 1000;
export const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024; // 100MB 