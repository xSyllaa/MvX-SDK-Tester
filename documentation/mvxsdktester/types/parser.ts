export interface ParsedQuery {
  userName?: string;
  repoName?: string;
  localPath: string;
  url?: string;
  slug: string;
  id: string;
  subpath: string;
  type?: 'blob' | 'tree';
  branch?: string;
  commit?: string;
  maxFileSize: number;
  ignorePatterns?: Set<string>;
  includePatterns?: Set<string>;
  patternType?: string;
}

export interface CloneConfig {
  url: string;
  localPath: string;
  commit?: string;
  branch?: string;
  repoName?: string;
  subpath?: string;
}

export const KNOWN_GIT_HOSTS = [
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "gitea.com",
  "codeberg.org",
  "gist.github.com",
]; 