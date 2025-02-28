"use client"

import { useRepoData } from "@/components/repo/RepoDataProvider"
import { Loader2, Search, Copy, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeMirror } from "@/components/code-mirror"
import { useCallback } from "react"

// Fonction pour déterminer le mode de langage en fonction de l'extension
function getLanguageModeForFile(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const modeMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'htmlmixed',
    'css': 'css',
    'json': 'application/json',
    'md': 'markdown',
    'php': 'php',
    'py': 'python',
    'go': 'go',
    'java': 'clike',
    'c': 'clike',
    'cpp': 'clike',
    'cs': 'clike',
    'rs': 'rust',
    'rb': 'ruby',
    'sh': 'shell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
  };
  
  return modeMap[extension || ''] || 'text/plain';
}

export function FileContent() {
  const { 
    loading, 
    selectedFile, 
    formatFileSize,
  } = useRepoData();

  // Fonction pour activer la recherche dans l'éditeur
  const handleSearchClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.openCodeMirrorSearch) {
      // @ts-ignore - Cette propriété est définie dynamiquement
      window.openCodeMirrorSearch();
    }
  }, []);

  // Fonction pour copier le contenu du fichier
  const handleCopyClick = useCallback(() => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content)
        .then(() => {
          // On pourrait ajouter une notification de succès ici
          console.log('Contenu copié dans le presse-papier');
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err);
        });
    }
  }, [selectedFile]);

  // Fonction pour télécharger le fichier
  const handleDownloadClick = useCallback(() => {
    if (selectedFile?.content && selectedFile?.name) {
      const blob = new Blob([selectedFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  return (
    <div className="rounded-lg border bg-background shadow-sm w-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold truncate max-w-[80%]">
              {selectedFile ? selectedFile.path : "File Content"}
            </h2>
            {selectedFile && selectedFile.content && (
              <div className="flex gap-3">
                <span className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                  {selectedFile.content.split('\n').length} lines
                </span>
                <span className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                  {formatFileSize(new TextEncoder().encode(selectedFile.content).length).replace("Bytes", "B")}
                </span>
              </div>
            )}
          </div>
          {selectedFile && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                title="Search in file (Ctrl+F)"
                onClick={handleSearchClick}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Copy content"
                onClick={handleCopyClick}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Download file"
                onClick={handleDownloadClick}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Share">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="h-[calc(100vh-12rem)] bg-muted/50 overflow-hidden relative">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : selectedFile ? (
          <div className="absolute inset-0 overflow-auto">
            <div className="w-full h-full bg-muted/50">
              <div className="w-full h-full code-editor-light">
                <CodeMirror
                  value={selectedFile.content || ''}
                  height="100%"
                  filename={selectedFile.name}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  );
} 