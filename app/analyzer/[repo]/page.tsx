"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, FileText, ChevronRight, ChevronDown, FolderTree, Search, Copy, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CodeMirror } from "@/components/code-mirror"
import { Octokit } from "octokit"

interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  content?: string
  children?: FileNode[]
  isOpen?: boolean
  sha?: string
}

const octokit = new Octokit()

export default function AnalyzerPage() {
  const params = useParams()
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"))
  const [loading, setLoading] = useState(true)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchFileContent = useCallback(async (owner: string, repo: string, path: string) => {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      })

      if ("content" in response.data && typeof response.data.content === "string") {
        return Buffer.from(response.data.content, "base64").toString()
      }
      return ""
    } catch (error) {
      console.error("Error fetching file content:", error)
      return ""
    }
  }, [])

  const fetchRepoStructure = useCallback(async (owner: string, repo: string, path = ""): Promise<FileNode[]> => {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      })

      if (Array.isArray(response.data)) {
        const nodes = await Promise.all(
          response.data.map(async (item) => {
            const node: FileNode = {
              name: item.name,
              path: item.path,
              type: item.type === "dir" ? "directory" : "file",
              sha: item.sha,
              isOpen: false,
            }

            if (item.type === "dir") {
              node.children = []
            }

            return node
          }),
        )

        return nodes.sort((a, b) => {
          if (a.type === "directory" && b.type === "file") return -1
          if (a.type === "file" && b.type === "directory") return 1
          return a.name.localeCompare(b.name)
        })
      }
    } catch (error) {
      console.error("Error fetching repo structure:", error)
      setError("Failed to fetch repository structure")
    }
    return []
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)
      const [owner, repo] = repoPath.split("/")
      const structure = await fetchRepoStructure(owner, repo)
      setFileTree(structure)
      setLoading(false)
    }

    init()
  }, [repoPath, fetchRepoStructure])

  const toggleFolder = async (node: FileNode) => {
    const updateNode = async (nodes: FileNode[]): Promise<FileNode[]> => {
      const newNodes = []
      for (const n of nodes) {
        if (n.path === node.path) {
          const [owner, repo] = repoPath.split("/")
          const children = n.isOpen ? [] : await fetchRepoStructure(owner, repo, n.path)
          newNodes.push({ ...n, isOpen: !n.isOpen, children })
        } else if (n.children) {
          newNodes.push({ ...n, children: await updateNode(n.children) })
        } else {
          newNodes.push(n)
        }
      }
      return newNodes
    }

    setFileTree(await updateNode(fileTree))
  }

  const handleFileClick = async (node: FileNode) => {
    if (node.type === "file") {
      const [owner, repo] = repoPath.split("/")
      const content = await fetchFileContent(owner, repo, node.path)
      setSelectedFile({ ...node, content })
    }
  }

  const FileTreeNode = ({ node }: { node: FileNode }) => {
    if (node.type === "file") {
      return (
        <div
          className={cn(
            "flex cursor-pointer items-center gap-2 py-1 pl-4 hover:bg-accent/50 rounded-sm",
            selectedFile?.path === node.path && "bg-accent",
          )}
          onClick={() => handleFileClick(node)}
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">{node.name}</span>
        </div>
      )
    }

    return (
      <div>
        <div
          className="flex cursor-pointer items-center gap-2 py-1 pl-4 hover:bg-accent/50 rounded-sm"
          onClick={() => toggleFolder(node)}
        >
          {node.isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono font-medium">{node.name}</span>
        </div>
        {node.isOpen && node.children && (
          <div className="ml-4">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} />
            ))}
          </div>
        )}
      </div>
    )
  }

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

