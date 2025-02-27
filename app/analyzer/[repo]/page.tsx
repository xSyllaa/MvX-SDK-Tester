"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, FileText, ChevronRight, ChevronDown, Search, Copy, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CodeMirror } from "@/components/code-mirror"
import { useGithubClone } from "@/app/hooks/useGithubClone"

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

export default function AnalyzerPage() {
  const params = useParams()
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"))
  const [loading, setLoading] = useState(true)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { cloneRepository, isLoading, error: cloneError } = useGithubClone()
  const isInitialMount = useRef(true)

  // Charger le dépôt une seule fois au montage du composant
  useEffect(() => {
    const fetchRepo = async () => {
      // Cette condition empêche la ré-exécution après le premier rendu
      if (!isInitialMount.current) return
      
      isInitialMount.current = false
      
      try {
        setLoading(true)
        setError(null)
        console.log("Chargement du dépôt:", repoPath)
        
        const result = await cloneRepository(`https://github.com/${repoPath}`)
        
        if (result.success) {
          console.log("Réussite du clonage, création de l'arborescence")
          
          // Construction de l'arbre de fichiers
          const nodes = result.data.map((item: FileNode) => ({
            ...item,
            isOpen: false,
            children: item.type === "directory" ? [] : undefined,
          }))
          
          // Organisation hiérarchique des fichiers/dossiers
          const rootNodes: FileNode[] = []
          const pathMap: Record<string, FileNode> = {}
          
          // Créer un map de tous les nœuds par chemin
          nodes.forEach(node => {
            pathMap[node.path] = node
          })
          
          // Organiser les nœuds dans une structure arborescente
          nodes.forEach(node => {
            if (node.path.includes('/')) {
              // Ce n'est pas un nœud racine
              const lastSlashIndex = node.path.lastIndexOf('/')
              const parentPath = node.path.substring(0, lastSlashIndex)
              const parent = pathMap[parentPath]
              
              if (parent && parent.children) {
                parent.children.push(node)
              } else {
                rootNodes.push(node)
              }
            } else {
              // Nœud racine
              rootNodes.push(node)
            }
          })
          
          // Trier les nœuds (dossiers d'abord, puis par nom)
          const sortNodes = (nodes: FileNode[]) => {
            return nodes.sort((a, b) => {
              if (a.type === "directory" && b.type === "file") return -1
              if (a.type === "file" && b.type === "directory") return 1
              return a.name.localeCompare(b.name)
            })
          }
          
          // Appliquer le tri à tous les niveaux
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
        } else {
          setError(result.error?.message || "Échec du clonage du dépôt")
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err)
        setError(err.message || "Une erreur s'est produite")
      } finally {
        setLoading(false)
      }
    }
    
    fetchRepo()
  }, []) // Dépendances vides pour n'exécuter qu'une seule fois

  // Si l'erreur vient du hook, la synchroniser
  useEffect(() => {
    if (cloneError) {
      setError(cloneError)
    }
  }, [cloneError])

  const handleFileClick = useCallback((node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node)
    }
  }, [])

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
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto grid grid-cols-[300px,1fr] gap-6 p-6 flex-1">
        {/* Left Panel - File Tree */}
        <div className="rounded-lg border bg-background shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Repository Structure</h2>
            {loading && <div className="mt-2 text-sm text-muted-foreground">Chargement en cours...</div>}
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
                Aucun fichier trouvé
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - File Content */}
        <div className="rounded-lg border bg-background shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedFile ? selectedFile.path : "File Content"}</h2>
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
          <div className="h-[calc(100vh-10rem)] bg-muted/50">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedFile ? (
              <div className="h-full">
                <CodeMirror
                  value={selectedFile.content || ""}
                  height="calc(100vh - 10rem)"
                  filename={selectedFile.name}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a file to view its content
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

