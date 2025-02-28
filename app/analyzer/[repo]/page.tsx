"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, FileText, ChevronRight, ChevronDown, Search, Copy, Download, Share, Star, GitFork } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CodeMirror } from "@/components/code-mirror"
import { useGithubClone } from "@/app/hooks/useGithubClone"
import { sdkList, tagCategoryColors, TagCategory } from '@/data/sdkData'

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  sha: string;
}

interface RepoMetadata {
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

interface ParsedRepo {
  owner: string;
  name: string;
  isValid: boolean;
  url: string;
  branch?: string;
  commit?: string;
  subpath?: string;
}

export default function AnalyzerPage() {
  const params = useParams()
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"))
  const [loading, setLoading] = useState(true)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null)
  const [parsedRepo, setParsedRepo] = useState<ParsedRepo | null>(null)
  const { cloneRepository, isLoading, error: cloneError } = useGithubClone()
  const isInitialMount = useRef(true)

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
        setFileTree(sortedRootNodes)
        
        // Step 5: Calculate repository statistics
        const stats = calculateRepoStats(sortedRootNodes)
        
        // Step 6: Update repository metadata with file stats
        setRepoMetadata({
          ...metadata,
          totalFiles: stats.files,
          totalSize: stats.size
        })
        
        // Step 7: Find and select README.md if it exists
        const readmeFile = findReadmeFile(sortedRootNodes)
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
  }, [])

  // Sync external errors
  useEffect(() => {
    if (cloneError) {
      setError(cloneError)
    }
  }, [cloneError])

  // File selection handler
  const handleFileClick = useCallback((node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node)
    }
  }, [])

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

  // File tree node component
  const FileTreeNode = useCallback(({ node }: { node: FileNode }) => {
    const isFolder = node.type === "directory"
    return (
      <div>
        <button
          onClick={() => isFolder ? toggleFolder(node) : handleFileClick(node)}
          className={cn(
            "flex items-center gap-2 px-2 py-1 text-sm w-full hover:bg-accent rounded-sm",
            selectedFile?.path === node.path && "bg-accent"
          )}
        >
          {isFolder ? (
            node.isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          {node.name}
        </button>
        {isFolder && node.isOpen && node.children && (
          <div className="ml-4">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} />
            ))}
          </div>
        )}
      </div>
    )
  }, [toggleFolder, handleFileClick, selectedFile])

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-4">
        {/* Metadata Section with Improved Layout & Loading State */}
        <div className="rounded-lg border bg-background shadow-sm w-full">
          <div className="p-4 border-b">
            {!repoMetadata ? (
              // Skeleton loader pour l'en-tête pendant le chargement
              <div>
                <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-full bg-muted rounded animate-pulse mt-2"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {repoMetadata.name}
                    <a 
                      href={repoMetadata.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-muted-foreground hover:text-primary"
                      title="View on GitHub"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1" title="Stars">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="font-semibold">{repoMetadata.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Forks">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.146.735-.565 1.791-1.778 2.252-1.192.452-2.053.953-2.646 1.536-.593-.583-1.453-1.084-2.646-1.536-1.213-.461-1.633-1.517-1.778-2.252C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-11 0C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4zm5 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5z"></path>
                      </svg>
                      <span className="font-semibold">{repoMetadata.forks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Description - Réduit l'espace en supprimant la marge supérieure */}
                <p className="text-muted-foreground">{repoMetadata.description}</p>
                
                {/* Tags - Only displayed if present */}
                {repoMetadata.tags && repoMetadata.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {repoMetadata.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                        style={{ 
                          backgroundColor: `${tagCategoryColors[tag.category]}20`, 
                          color: tagCategoryColors[tag.category],
                          border: `1px solid ${tagCategoryColors[tag.category]}`
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats Grid with Loading State */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y">
            {!repoMetadata ? (
              // Skeleton loader pour les statistiques
              <>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Files</div>
                  <div className="h-6 w-16 bg-muted rounded animate-pulse mt-1"></div>
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Size</div>
                  <div className="h-6 w-24 bg-muted rounded animate-pulse mt-1"></div>
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Language</div>
                  <div className="h-6 w-20 bg-muted rounded animate-pulse mt-1"></div>
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Last Updated</div>
                  <div className="h-6 w-28 bg-muted rounded animate-pulse mt-1"></div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Files</div>
                  <div className="text-2xl font-bold">{repoMetadata.totalFiles.toLocaleString()}</div>
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Size</div>
                  <div className="text-2xl font-bold">{formatFileSize(repoMetadata.totalSize)}</div>
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Language</div>
                  <div className="text-2xl font-bold">{repoMetadata.language || '—'}</div>
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Last Updated</div>
                  <div className="text-2xl font-bold">
                    {repoMetadata.lastUpdated ? new Date(repoMetadata.lastUpdated).toLocaleDateString() : '—'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area - File Tree and File Content */}
        <div className="grid grid-cols-[300px,1fr] gap-6">
          {/* Left Panel - File Tree */}
          <div className="rounded-lg border bg-background shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Repository Structure</h2>
              {loading && <div className="mt-2 text-sm text-muted-foreground">Loading repository...</div>}
            </div>
            <div className="p-2 h-[calc(100vh-10rem)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-sm text-destructive">{error}</div>
              ) : fileTree.length > 0 ? (
                fileTree.map((node) => <FileTreeNode key={node.path} node={node} />)
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No files found
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - File Content */}
          <div className="rounded-lg border bg-background shadow-sm w-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold truncate max-w-[80%]">{selectedFile ? selectedFile.path : "File Content"}</h2>
                {selectedFile && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="Search">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Copy">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Share">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[calc(100vh-10rem)] bg-muted/50 overflow-hidden relative">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedFile ? (
                <div className="absolute inset-0 overflow-auto">
                  <div className="w-full h-full">
                    <CodeMirror
                      value={selectedFile.content || ""}
                      height="100%"
                      filename={selectedFile.name}
                      options={{
                        lineWrapping: true,
                        theme: 'dark'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Select a file to view its content
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

