import { InvalidPatternError } from '../types/errors';

export function validatePattern(pattern: string): void {
  if (!isValidPattern(pattern)) {
    throw new InvalidPatternError(pattern);
  }
}

export function isValidPattern(pattern: string): boolean {
  return /^[a-zA-Z0-9\-_.\/+*@]+$/.test(pattern);
}

// Fonctions manquantes pour vérifier l'inclusion/exclusion des fichiers
export function isIncluded(filename: string): boolean {
  // Implémenter la logique pour vérifier si un fichier doit être inclus
  // Par défaut, inclure tous les fichiers
  return true;
}

export function isExcluded(filename: string): boolean {
  // Vérifier si le fichier correspond à l'un des modèles d'exclusion par défaut
  return DEFAULT_IGNORE_PATTERNS.has(filename) || 
         Array.from(DEFAULT_IGNORE_PATTERNS).some(pattern => {
           if (pattern.includes('*')) {
             // Simple implémentation pour les patterns avec jokers
             const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
             return regex.test(filename);
           }
           return false;
         });
}

export const DEFAULT_IGNORE_PATTERNS = new Set([
  // Node
  'node_modules',
  'package-lock.json',
  'yarn.lock',
  '.next',
  '.nuxt',
  'dist',
  'build',
  
  // Version Control
  '.git',
  '.gitignore',
  
  // IDE
  '.idea',
  '.vscode',
  
  // Misc
  '.DS_Store',
  'Thumbs.db',
  
  // Build artifacts
  '*.log',
  '*.pid',
  '*.seed',
  
  // Test coverage
  'coverage',
  '.nyc_output',
  
  // Environment
  '.env',
  '.env.*',
]); 