export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DIRECTORY_DEPTH = 10;
export const MAX_FILES = 1000;
export const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export const DEFAULT_IGNORE_PATTERNS = new Set([
  'node_modules',
  'package-lock.json',
  'yarn.lock',
  '.next',
  '.git',
  '.env',
  'dist',
  'build',
  'coverage'
]); 