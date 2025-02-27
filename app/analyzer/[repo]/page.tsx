"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, FileText, ChevronRight, ChevronDown, FolderTree, Search, Copy, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CodeMirror } from "@/components/code-mirror"
import { Octokit } from "octokit"
import { useGithubClone } from "@/app/hooks/useGithubClone"

interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  content?: string
  children?: FileNode[]
  isOpen?: boolean
  sha?: string
}

interface GitHubContent {
  name: string
  path: string
  type: string
  sha: string
  content?: string
}

const octokit = new Octokit()

export default function AnalyzerPage() {
  const params = useParams()
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"))
  const [loading, setLoading] = useState(true)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const repoDataRef = useRef<GitHubContent[]>([])
  const initializationRef = useRef(false)

  const { cloneRepository } = useGithubClone({
    token: process.env.NEXT_PUBLIC_GITHUB_TOKEN
  })

  const fetchFileContent = useCallback(async (path: string) => {
    try {
      const file = repoDataRef.current.find((f) => f.path === path)
      if (file && typeof file.content === 'string' && file.content.length > 0) {
        return Buffer.from(file.content, 'base64').toString('utf-8')
      }
      return ""
    } catch (error) {
      console.error("Error fetching file content:", error)
      return ""
    }
  }, [])

  const initializeRepo = useCallback(async () => {
    if (!repoPath || initializationRef.current) return
    
    try {
      setLoading(true)
      setError(null)
      
      const [owner, repo] = repoPath.split("/")
      const result = await cloneRepository(`https://github.com/${owner}/${repo}`)
      
      if (result.success) {
        repoDataRef.current = result.data
        initializationRef.current = true
        
        const nodes: FileNode[] = result.data.map((item: GitHubContent) => ({
          name: item.name,
          path: item.path,
          type: item.type === "dir" ? "directory" : "file",
          sha: item.sha,
          isOpen: false,
          children: item.type === "dir" ? [] : undefined,
        }))

        const sortedNodes = nodes.sort((a, b) => {
          if (a.type === "directory" && b.type === "file") return -1
          if (a.type === "file" && b.type === "directory") return 1
          return a.name.localeCompare(b.name)
        })

        setFileTree(sortedNodes)
      } else {
        setError("Failed to clone repository")
      }
    } catch (err) {
      setError("An error occurred while initializing the repository")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [repoPath, cloneRepository])

  useEffect(() => {
    initializeRepo()
  }, [initializeRepo])

  const handleFileClick = useCallback(async (node: FileNode) => {
    if (node.type === "file") {
      const content = await fetchFileContent(node.path)
      setSelectedFile({ ...node, content })
    }
  }, [fetchFileContent])

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
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex w-full justify-between items-center gap-6 md:gap-10">
            <Link href="/" className="font-bold text-xl tracking-tight">
              MvX SDK Analyzer
            </Link>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SDKs & ABIs or paste any github url"
                className="w-full pl-8 font-mono text-sm bg-background border-muted"
              />
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/analyzer" className="transition-colors hover:text-foreground/80 text-foreground">
                Analyzer
              </Link>
              <Link href="/components" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Components
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid grid-cols-[300px,1fr] gap-6 p-6 flex-1">
        {/* Left Panel - File Tree */}
        <div className="rounded-lg border bg-background shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Repository Structure</h2>
          </div>
          <div className="p-2 h-[calc(100vh-10rem)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-sm text-destructive">{error}</div>
            ) : (
              fileTree.map((node) => <FileTreeNode key={node.path} node={node} />)
            )}
          </div>
        </div>

        {/* Right Panel - File Content */}
        <div className="rounded-lg border bg-background shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedFile ? selectedFile.path : "File Content"}</h2>
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
            </div>
          </div>
          <div className="h-[calc(100vh-10rem)] bg-muted/50">
            {selectedFile ? (
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

