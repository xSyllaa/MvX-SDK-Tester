import { useState, useRef } from "react";
import { Octokit } from "octokit";
import JSZip from "jszip";

interface CloneConfig {
  url: string;
  branch?: string;
  maxFileSize?: number;
  maxFiles?: number;
  includeBinaries?: boolean;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  maxTotalSize?: number;
  timeout?: number;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  content?: string;
  children?: FileNode[];
  sha: string;
}

interface CloneResult {
  success: boolean;
  data: FileNode[];
  stats: {
    totalFiles: number;
    processedFiles: number;
    excludedFiles: number;
    totalSize: number;
  };
  error?: {
    message: string;
    status?: number;
    details?: string;
  };
}

const DEFAULT_CONFIG: Partial<CloneConfig> = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5000,
  includeBinaries: false,
  excludePatterns: [
    /^\.git\//,
    /^node_modules\//,
    /^__pycache__\//,
    /\.pyc$/,
    /\.exe$/,
    /\.dll$/,
    /\.so$/,
    /\.dylib$/,
    /\.zip$/,
    /\.tar$/,
    /\.gz$/,
    /\.jar$/,
    /\.class$/,
    /\.mp3$/,
    /\.mp4$/,
    /\.avi$/,
    /\.mov$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.bmp$/,
    /\.ico$/,
    /\.svg$/,
    /\.woff$/,
    /\.ttf$/,
    /\.eot$/
  ],
  maxTotalSize: 100 * 1024 * 1024, // 100MB
  timeout: 60000, // 60 secondes
};

const TEXT_EXTENSIONS = [
  '.txt', '.md', '.markdown', '.rst', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg',
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.go',
  '.rs', '.rb', '.php', '.html', '.htm', '.css', '.scss', '.sass', '.less', '.sh', '.bash',
  '.zsh', '.fish', '.ps1', '.swift', '.kt', '.kts', '.scala', '.lua', '.r', '.m', '.mm',
  '.sql', '.graphql', '.gql'
];

export function useGithubClone() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const isValidGithubUrl = (url: string): boolean => {
    return /^https?:\/\/github\.com\/[^\/]+\/[^\/]+/.test(url);
  };

  const extractRepoInfo = (url: string): { owner: string; repo: string } | null => {
    const matches = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!matches) return null;
    return { owner: matches[1], repo: matches[2].replace(/\.git$/, '') };
  };

  const shouldIncludeFile = (
    path: string, 
    size: number, 
    config: CloneConfig, 
    stats: CloneResult['stats']
  ): boolean => {
    if (size > config.maxFileSize!) return false;
    
    if (stats.totalSize + size > config.maxTotalSize!) return false;
    
    if (config.excludePatterns?.some(pattern => pattern.test(path))) return false;
    
    if (config.includePatterns && config.includePatterns.length > 0) {
      return config.includePatterns.some(pattern => pattern.test(path));
    }
    
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    const isText = TEXT_EXTENSIONS.some(textExt => path.endsWith(textExt));
    
    if (!isText && !config.includeBinaries) return false;
    
    return true;
  };

  const cloneRepository = async (url: string, config?: Partial<CloneConfig>): Promise<CloneResult> => {
    const fullConfig: CloneConfig = { 
      url,
      ...DEFAULT_CONFIG, 
      ...config 
    };
    
    const stats: CloneResult['stats'] = {
      totalFiles: 0,
      processedFiles: 0,
      excludedFiles: 0,
      totalSize: 0
    };
    
    setIsLoading(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, fullConfig.timeout);
    
    console.log("🚀 Démarrage du clonage du dépôt:", url);
    
    try {
      if (!isValidGithubUrl(url)) {
        throw new Error('URL GitHub invalide');
      }
      
      const repoInfo = extractRepoInfo(url);
      if (!repoInfo) {
        throw new Error('Impossible d\'extraire les informations du dépôt');
      }
      console.log(`📂 Extraction des données: owner=${repoInfo.owner}, repo=${repoInfo.repo}`);
      
      console.log("⏳ Récupération des métadonnées du dépôt...");
      const octokit = new Octokit({
        auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN || ""
      });
      
      const { data: repoData } = await octokit.rest.repos.get({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
      });
      console.log("✅ Métadonnées récupérées:", repoData.full_name, "- Étoiles:", repoData.stargazers_count);
      
      const branchToUse = fullConfig.branch || repoData.default_branch;
      console.log(`🔄 Utilisation de la branche: ${branchToUse}`);
      
      const githubZipUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/zipball/${branchToUse}`;
      const proxyUrl = `/api/repo-proxy?url=${encodeURIComponent(githubZipUrl)}`;
      
      console.log("📦 Téléchargement de l'archive ZIP du dépôt...");
      
      const zipResponse = await fetch(proxyUrl, { 
        signal: abortControllerRef.current.signal
      });
      
      if (!zipResponse.ok) {
        throw new Error(`Impossible de télécharger l'archive: ${zipResponse.status}`);
      }
      
      console.log("🔄 Extraction et traitement de l'archive...");
      const zipBlob = await zipResponse.blob();
      const zip = await JSZip.loadAsync(zipBlob);
      
      console.log("🔨 Construction de la structure de fichiers...");
      const fileNodes: FileNode[] = [];
      const folderNodes = new Map<string, FileNode>();
      
      const rootFolderPrefix = Object.keys(zip.files)[0].split('/')[0] + '/';
      
      for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (path === rootFolderPrefix) continue;
        
        const normalizedPath = path.replace(rootFolderPrefix, '');
        if (!normalizedPath) continue;
        
        stats.totalFiles++;
        
        if (zipEntry.dir) {
          const folderNode: FileNode = {
            name: normalizedPath.split('/').pop() || normalizedPath,
            path: normalizedPath,
            type: 'directory',
            children: [],
            sha: `dir-${normalizedPath}`
          };
          
          folderNodes.set(normalizedPath, folderNode);
          continue;
        }
        
        const fileSize = await zipEntry.async('uint8array').then(data => data.byteLength);
        
        if (!shouldIncludeFile(normalizedPath, fileSize, fullConfig, stats)) {
          stats.excludedFiles++;
          continue;
        }
        
        if (stats.processedFiles >= fullConfig.maxFiles!) {
          console.warn(`⚠️ Limite de ${fullConfig.maxFiles} fichiers atteinte`);
          break;
        }
        
        const fileNode: FileNode = {
          name: normalizedPath.split('/').pop() || normalizedPath,
          path: normalizedPath,
          type: 'file',
          size: fileSize,
          sha: `zip-${path}`
        };
        
        const ext = normalizedPath.substring(normalizedPath.lastIndexOf('.')).toLowerCase();
        const isText = TEXT_EXTENSIONS.some(textExt => normalizedPath.endsWith(textExt));
        
        if (isText) {
          try {
            fileNode.content = await zipEntry.async('string');
          } catch (err) {
            console.warn(`⚠️ Impossible de lire le contenu de ${normalizedPath}`);
          }
        }
        
        fileNodes.push(fileNode);
        stats.processedFiles++;
        stats.totalSize += fileSize;
      }
      
      for (const fileNode of fileNodes) {
        const pathParts = fileNode.path.split('/');
        
        if (pathParts.length <= 1) continue;
        
        let currentPath = '';
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!folderNodes.has(currentPath)) {
            const folderNode: FileNode = {
              name: part,
              path: currentPath,
              type: 'directory',
              children: [],
              sha: `dir-${currentPath}`
            };
            
            folderNodes.set(currentPath, folderNode);
          }
        }
      }
      
      const allNodes = [...fileNodes, ...folderNodes.values()];
      
      console.log(`✅ Structure construite avec succès:`);
      console.log(`   - Fichiers: ${stats.processedFiles}/${stats.totalFiles}`);
      console.log(`   - Fichiers exclus: ${stats.excludedFiles}`);
      console.log(`   - Taille totale: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   - Dossiers: ${folderNodes.size}`);
      console.log("🎉 Clonage terminé avec succès");
      
      return {
        success: true,
        data: allNodes,
        stats
      };
    } catch (err: any) {
      console.error('❌ Erreur de clonage:', err);
      
      let errorMessage: { message: string; status?: number; details?: string } = {
        message: 'Erreur lors du clonage du dépôt',
        status: err.status || err.response?.status,
        details: err.message || err.response?.data?.message
      };
      
      if (err.name === 'AbortError') {
        errorMessage = {
          message: 'Opération annulée',
          status: undefined,
          details: `Délai d'attente dépassé (${fullConfig.timeout}ms)`
        };
      }
      
      setError(`${errorMessage.message}${errorMessage.status ? ` (${errorMessage.status})` : ''}: ${errorMessage.details}`);
      
      return {
        success: false,
        data: [],
        stats,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
    }
  };
  
  const cancelClone = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log("🛑 Clonage annulé par l'utilisateur");
    }
  };

  return {
    cloneRepository,
    cancelClone,
    isLoading,
    error
  };
} 