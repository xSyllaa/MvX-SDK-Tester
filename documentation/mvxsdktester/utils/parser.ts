import { ParsedQuery, KNOWN_GIT_HOSTS } from '../types/parser';
import { validatePattern } from '../utils/patterns';

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function parseQuery(
  source: string,
  options: {
    maxFileSize?: number;
    fromWeb?: boolean;
    includePatterns?: string | Set<string>;
    ignorePatterns?: string | Set<string>;
  } = {}
): Promise<ParsedQuery> {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    fromWeb = false,
    includePatterns,
    ignorePatterns
  } = options;

  // Determine if source is a web URL
  const isWebUrl = fromWeb || 
    source.startsWith('http') || 
    KNOWN_GIT_HOSTS.some(host => source.includes(host));

  // Parse based on source type
  const parsedQuery = isWebUrl 
    ? await parseRepoSource(source)
    : parsePath(source);

  // Process patterns
  const processedIgnorePatterns = ignorePatterns 
    ? parsePatterns(ignorePatterns) 
    : new Set<string>();

  const processedIncludePatterns = includePatterns
    ? parsePatterns(includePatterns)
    : undefined;

  return {
    ...parsedQuery,
    maxFileSize,
    ignorePatterns: processedIgnorePatterns,
    includePatterns: processedIncludePatterns
  };
}

async function parseRepoSource(source: string): Promise<ParsedQuery> {
  const url = new URL(source.startsWith('http') ? source : `https://${source}`);
  
  // Validate host
  const host = url.hostname.toLowerCase();
  if (!KNOWN_GIT_HOSTS.includes(host)) {
    throw new Error(`Unknown Git host: ${host}`);
  }

  // Extract user and repo from path
  const [userName, repoName] = getRepoInfoFromPath(url.pathname);
  
  // Generate unique ID and slug
  const id = crypto.randomUUID();
  const slug = `${userName}-${repoName}`;

  // Parse remaining path components for branch/commit info
  const pathParts = url.pathname.split('/').filter(Boolean);
  const remainingParts = pathParts.slice(2);

  const query: ParsedQuery = {
    userName,
    repoName,
    url: `https://${host}/${userName}/${repoName}`,
    localPath: `/tmp/mvx-sdk/${id}/${slug}`, // Adapt path as needed
    slug,
    id,
    subpath: '/',
    maxFileSize: DEFAULT_MAX_FILE_SIZE
  };

  if (remainingParts.length > 0) {
    const [type, ...rest] = remainingParts;
    
    if (['blob', 'tree'].includes(type)) {
      query.type = type as 'blob' | 'tree';
      
      if (rest.length > 0) {
        const [branchOrCommit, ...subpath] = rest;
        
        if (isCommitHash(branchOrCommit)) {
          query.commit = branchOrCommit;
        } else {
          query.branch = branchOrCommit;
        }
        
        if (subpath.length > 0) {
          query.subpath = '/' + subpath.join('/');
        }
      }
    }
  }

  return query;
}

function parsePath(path: string): ParsedQuery {
  const normalizedPath = path.replace(/\\/g, '/');
  const parts = normalizedPath.split('/').filter(Boolean);
  
  return {
    localPath: normalizedPath,
    slug: parts.slice(-2).join('/'),
    id: crypto.randomUUID(),
    subpath: '/',
    maxFileSize: DEFAULT_MAX_FILE_SIZE
  };
}

function getRepoInfoFromPath(path: string): [string, string] {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Invalid repository path: ${path}`);
  }
  return [parts[0], parts[1]];
}

function isCommitHash(str: string): boolean {
  return /^[0-9a-f]{40}$/i.test(str);
}

function parsePatterns(patterns: string | Set<string>): Set<string> {
  const patternSet = typeof patterns === 'string' 
    ? new Set(patterns.split(/[,\s]+/).filter(Boolean))
    : patterns;

  for (const pattern of patternSet) {
    validatePattern(pattern);
  }

  return new Set(
    Array.from(patternSet).map(p => normalizePattern(p))
  );
}

function normalizePattern(pattern: string): string {
  pattern = pattern.replace(/^\/+/, '');
  if (pattern.endsWith('/')) {
    pattern += '*';
  }
  return pattern;
} 