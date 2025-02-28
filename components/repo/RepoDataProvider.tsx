"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react"
import { useGithubClone } from "@/hooks/useGithubClone"
import { sdkList, TagCategory } from '@/data/sdkData'

// Types
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

// Contexte pour les données du dépôt
interface RepoDataContextType {
  loading: boolean;
  error: string | null;
  fileTree: FileNode[];
  selectedFile: FileNode | null;
  repoMetadata: RepoMetadata | null;
  parsedRepo: ParsedRepo | null;
  setSelectedFile: (file: FileNode | null) => void;
  toggleFolder: (node: FileNode) => void;
  formatFileSize: (bytes: number) => string;
  countItems: (node: FileNode) => number;
  calculateFolderSize: (node: FileNode) => number;
}

const RepoDataContext = createContext<RepoDataContextType | null>(null);

export const useRepoData = () => {
  const context = useContext(RepoDataContext);
  if (!context) {
    throw new Error("useRepoData doit être utilisé à l'intérieur d'un RepoDataProvider");
  }
  return context;
};

interface RepoDataProviderProps {
  repoPath: string;
  children: ReactNode;
}

export function RepoDataProvider({ repoPath, children }: RepoDataProviderProps) {
  const [loading, setLoading] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);
  const [parsedRepo, setParsedRepo] = useState<ParsedRepo | null>(null);
  const { cloneRepository, isLoading, error: cloneError } = useGithubClone();
  const isInitialMount = useRef(true);

  // 1. Parse and validate repository URL
  const parseRepositoryUrl = useCallback((repoPath: string): ParsedRepo => {
    // Similar to query_parser.py's functionality
    const parts = repoPath.split('/')
    
    if (parts.length < 2) {
      return {
        owner: '',
        name: '',
        isValid: false,
        url: ''
      }
    }
    
    const owner = parts[0]
    const name = parts[1]
    let branch, commit, subpath
    
    // Check for branch or commit info in URL
    if (parts.length > 2) {
      const possibleType = parts[2] // 'tree', 'blob', etc.
      
      if (possibleType === 'tree' && parts.length > 3) {
        // Could be a branch or commit hash
        const branchOrCommit = parts[3]
        // Simplistic check for commit hash - in production would check more thoroughly
        if (/^[0-9a-f]{40}$/.test(branchOrCommit)) {
          commit = branchOrCommit
        } else {
          branch = branchOrCommit
        }
        
        // If there are more path components after branch/commit, that's the subpath
        if (parts.length > 4) {
          subpath = '/' + parts.slice(4).join('/')
        }
      }
    }
    
    return {
      owner,
      name,
      isValid: true,
      url: `https://github.com/${owner}/${name}`,
      branch,
      commit,
      subpath: subpath || '/'
    }
  }, [])

  // 2. Check if repository exists and fetch metadata
  const fetchRepoMetadata = useCallback(async (parsedRepo: ParsedRepo) => {
    if (!parsedRepo.isValid) {
      throw new Error("Invalid repository path")
    }
    
    try {
      const response = await fetch(`https://api.github.com/repos/${parsedRepo.owner}/${parsedRepo.name}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Repository not found or may be private")
        }
        throw new Error(`Failed to fetch repository data: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Construire l'URL GitHub pour rechercher dans la liste des SDKs
      const repoUrl = `https://github.com/${parsedRepo.owner}/${parsedRepo.name}`;
      
      // Chercher si ce repo existe dans notre liste de SDKs
      const matchingSDK = sdkList.find(sdk => 
        sdk.github_link.toLowerCase() === repoUrl.toLowerCase() ||
        sdk.github_link.toLowerCase().includes(`${parsedRepo.owner}/${parsedRepo.name}`.toLowerCase())
      );
      const tags = matchingSDK?.tags || [];
      
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description || 'No description available',
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        lastUpdated: data.updated_at,
        owner: data.owner.login,
        repoUrl: data.html_url,
        defaultBranch: data.default_branch,
        visibility: data.visibility,
        hasSources: true,
        tags: tags
      }
    } catch (err) {
      console.error("Error fetching repo metadata:", err)
      throw err
    }
  }, [])
  
  // 3. Calculate repository statistics from file tree
  const calculateRepoStats = useCallback((nodes: FileNode[]): { files: number, size: number } => {
    return nodes.reduce((acc, node) => {
      if (node.type === 'file') {
        return { 
          files: acc.files + 1, 
          size: acc.size + (node.size || 0) 
        }
      } else if (node.children) {
        const childStats = calculateRepoStats(node.children)
        return { 
          files: acc.files + childStats.files, 
          size: acc.size + childStats.size 
        }
      }
      return acc
    }, { files: 0, size: 0 })
  }, [])

  // 4. Find README.md file in the repository
  const findReadmeFile = useCallback((nodes: FileNode[]): FileNode | null => {
    // First check for README.md at the root level
    const rootReadme = nodes.find(node => 
      node.type === 'file' && node.name.toLowerCase() === 'readme.md'
    )
    
    if (rootReadme) return rootReadme
    
    // If not found at root, search recursively
    for (const node of nodes) {
      if (node.type === 'directory' && node.children) {
        const readme = findReadmeFile(node.children)
        if (readme) return readme
      }
    }
    
    return null
  }, [])

  // 5. Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Modification de la fonction cleanFileTree pour mieux détecter les dossiers vides
  const cleanFileTree = useCallback((node: FileNode): FileNode | null => {
    if (node.type !== "directory" || !node.children) {
      return node;
    }

    // Nettoyer récursivement tous les enfants d'abord (et filtrer les null)
    const cleanedChildren = node.children
      .map(cleanFileTree)
      .filter((child): child is FileNode => child !== null);
    
    // Si le dossier est vide (0 enfants) et se termine par '/' (comme dans l'image), le supprimer
    if (cleanedChildren.length === 0 && node.path.endsWith('/')) {
      return null;
    }
    
    // Vérifier s'il y a un sous-dossier avec le même nom
    const sameDirChild = cleanedChildren.find(child => 
      child.type === "directory" && 
      child.name === node.name
    );

    // Si un tel sous-dossier existe, fusionner ses enfants avec le dossier parent
    if (sameDirChild && sameDirChild.children) {
      return {
        ...node,
        children: [
          ...cleanedChildren.filter(child => child !== sameDirChild),
          ...(sameDirChild.children)
        ]
      };
    }

    // S'il n'y a pas d'enfants et que c'est un dossier de second niveau (contient un slash), le filtrer
    if (cleanedChildren.length === 0 && node.path.includes('/')) {
      return null;
    }

    // Sinon, retourner le nœud avec ses enfants nettoyés
    return {
      ...node,
      children: cleanedChildren
    };
  }, []);

  // Fonction pour compter tous les éléments (fichiers + dossiers)
  const countItems = useCallback((node: FileNode): number => {
    if (node.type === "file") {
      return 1;
    }
    
    if (node.type === "directory" && node.children) {
      // Compte 1 pour le dossier lui-même + tous ses enfants
      return 1 + node.children.reduce((count, child) => {
        return count + countItems(child);
      }, 0);
    }
    
    return 0;
  }, []);

  // Fonction pour calculer la taille totale d'un dossier
  const calculateFolderSize = useCallback((node: FileNode): number => {
    if (node.type === "file") {
      return node.size || 0;
    }
    
    if (node.type === "directory" && node.children) {
      return node.children.reduce((size, child) => {
        return size + calculateFolderSize(child);
      }, 0);
    }
    
    return 0;
  }, []);

  // Directory expansion handler
  const toggleFolder = useCallback((node: FileNode) => {
    setFileTree(currentTree => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(n => {
          if (n.path === node.path) {
            return { ...n, isOpen: !n.isOpen }
          }
          if (n.children) {
            return { ...n, children: updateNode(n.children) }
          }
          return n
        })
      }
      return updateNode(currentTree)
    })
  }, [])

  // Main repository loading function
  useEffect(() => {
    const analyzeRepository = async () => {
      if (!isInitialMount.current) return
      isInitialMount.current = false
      
      try {
        setLoading(true)
        setError(null)
        
        // Step 1: Parse the repository URL
        const parsed = parseRepositoryUrl(repoPath)
        setParsedRepo(parsed)
        
        if (!parsed.isValid) {
          throw new Error("Invalid repository path format")
        }
        
        console.log("Analyzing repository:", parsed.url)
        
        // Step 2: Fetch repository metadata
        const metadata = await fetchRepoMetadata(parsed)
        
        // Step 3: Clone the repository
        const result = await cloneRepository(parsed.url)
        
        if (!result.success) {
          throw new Error(result.error?.message || "Failed to clone repository")
        }
        
        console.log("Repository cloned, building file tree...")
        
        // Step 4: Build the file tree
        const nodes = result.data.map((item: FileNode) => ({
          ...item,
          isOpen: false,
          children: item.type === "directory" ? [] : undefined,
        }))
        
        // Organization into tree structure (same as before)
        const rootNodes: FileNode[] = []
        const pathMap: Record<string, FileNode> = {}
        
        nodes.forEach(node => {
          pathMap[node.path] = node
        })
        
        nodes.forEach(node => {
          if (node.path.includes('/')) {
            const lastSlashIndex = node.path.lastIndexOf('/')
            const parentPath = node.path.substring(0, lastSlashIndex)
            const parent = pathMap[parentPath]
            
            if (parent && parent.children) {
              parent.children.push(node)
            } else {
              rootNodes.push(node)
            }
          } else {
            rootNodes.push(node)
          }
        })
        
        // Sort the nodes
        const sortNodes = (nodes: FileNode[]) => {
          return nodes.sort((a, b) => {
            if (a.type === "directory" && b.type === "file") return -1
            if (a.type === "file" && b.type === "directory") return 1
            return a.name.localeCompare(b.name)
          })
        }
        
        const sortRecursive = (nodes: FileNode[]) => {
          const sorted = sortNodes(nodes)
          sorted.forEach(node => {
            if (node.children && node.children.length > 0) {
              node.children = sortRecursive(node.children)
            }
          })
          return sorted
        }
        
        const sortedRootNodes = sortRecursive(rootNodes)
        const cleanedFileTree = sortedRootNodes.map(cleanFileTree).filter((node): node is FileNode => node !== null)
        setFileTree(cleanedFileTree.filter((node): node is FileNode => node !== null))
        
        // Step 5: Calculate repository statistics
        const stats = calculateRepoStats(cleanedFileTree)
        
        // Step 6: Update repository metadata with file stats
        setRepoMetadata({
          ...metadata,
          totalFiles: stats.files,
          totalSize: stats.size
        })
        
        // Step 7: Find and select README.md if it exists
        const readmeFile = findReadmeFile(cleanedFileTree)
        if (readmeFile) {
          setSelectedFile(readmeFile)
        }
        
      } catch (err: any) {
        console.error("Error during repository analysis:", err)
        setError(err.message || "An error occurred during repository analysis")
      } finally {
        setLoading(false)
      }
    }
    
    analyzeRepository()
  }, [repoPath, cloneRepository, parseRepositoryUrl, fetchRepoMetadata, calculateRepoStats, findReadmeFile, cleanFileTree])

  // Sync external errors
  useEffect(() => {
    if (cloneError) {
      setError(cloneError)
    }
  }, [cloneError])

  const value = {
    loading,
    error,
    fileTree,
    selectedFile,
    repoMetadata,
    parsedRepo,
    setSelectedFile,
    toggleFolder,
    formatFileSize,
    countItems,
    calculateFolderSize
  };

  return (
    <RepoDataContext.Provider value={value}>
      {children}
    </RepoDataContext.Provider>
  );
} 