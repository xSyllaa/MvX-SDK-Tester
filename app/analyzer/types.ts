import { TagCategory } from '@/data/sdkData';

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  sha: string;
}

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  tags: { name: string; category: TagCategory }[];
  totalFiles: number;
  totalSize: number;
  language?: string;
  lastUpdated?: string;
  owner: string;
  repoUrl: string;
  defaultBranch?: string;
  visibility?: string;
  hasSources?: boolean;
}

export interface ParsedRepo {
  owner: string;
  name: string;
  isValid: boolean;
  url: string;
  branch?: string;
  commit?: string;
  subpath?: string;
} 