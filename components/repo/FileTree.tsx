"use client"

import { useRepoData } from "@/components/repo/RepoDataProvider"
import { FileNode } from "@/app/analyzer/types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, FileText, BarChart2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useParams } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useCallback } from "react"

export function FileTree() {
  const params = useParams();
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"));
  
  const { 
    fileTree, 
    loading, 
    error, 
    selectedFile, 
    setSelectedFile,
    toggleFolder, 
    formatFileSize, 
    countItems, 
    calculateFolderSize
  } = useRepoData();

  // État local pour le toggle des statistiques
  const [showFileStats, setShowFileStats] = useState(false);

  // Fonction pour gérer le clic sur un fichier
  const handleFileClick = useCallback((node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node);
    }
  }, [setSelectedFile]);

  // Fonction modifiée pour utiliser "B" au lieu de "Bytes"
  const formatSize = (size: number) => {
    const formattedSize = formatFileSize(size);
    return formattedSize.replace("Bytes", "B");
  };

  // Composant récursif pour afficher chaque nœud de l'arbre
  const FileTreeNode = ({ node }: { node: FileNode }) => {
    const isFolder = node.type === "directory";
    const itemCount = isFolder && node.children ? countItems(node) - 1 : 0; // -1 pour ne pas compter le dossier lui-même
    const size = node.type === "file" ? node.size || 0 : calculateFolderSize(node);
    
    return (
      <div>
        {/* La div entière est maintenant cliquable */}
        <div 
          onClick={() => isFolder ? toggleFolder(node) : handleFileClick(node)}
          className={cn(
            "flex items-center justify-between px-2 py-1 rounded-sm cursor-pointer",
            selectedFile?.path === node.path ? "bg-accent/80" : "hover:bg-accent/40",
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {isFolder ? (
                <>
                  {node.isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  {/* Nombre d'éléments sous la flèche (seulement si showFileStats est true) */}
                  {showFileStats && itemCount > 0 && (
                    <span className="absolute -bottom-2 left-[60%] transform -translate-x text-[8px] font-medium text-muted-foreground">
                      {itemCount}
                    </span>
                  )}
                </>
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className={cn(
              "truncate",
              selectedFile?.path === node.path && "font-medium"
            )}>{node.name}</span>
          </div>
          
          {/* Taille du fichier/dossier à droite (seulement si showFileStats est true) */}
          {showFileStats && (
            <span className="text-xs text-muted-foreground ml-2">
              {formatSize(size)}
            </span>
          )}
        </div>
        {isFolder && node.isOpen && node.children && (
          <div className="ml-4">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-background shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Repository Structure</h2>
        
        {/* Toggle modernisé avec tooltip instantané */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "relative h-8 px-2 flex items-center rounded-full transition-colors",
                  showFileStats ? "bg-primary/10" : "bg-muted/70"
                )}>
                  <BarChart2 className={cn(
                    "h-4 w-4 absolute left-2.5 transition-colors",
                    showFileStats ? "text-primary" : "text-muted-foreground"
                  )} />
                  <Switch 
                    checked={showFileStats} 
                    onCheckedChange={setShowFileStats}
                    className="ml-5 data-[state=checked]:bg-primary"
                    aria-label="Toggle file statistics"
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={5}>
              <p>Toggle file statistics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="p-2 h-[calc(100vh-10rem)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
  );
} 