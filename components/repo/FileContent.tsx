"use client"

import { useRepoData } from "@/components/repo/RepoDataProvider"
import { Loader2, Search, Copy, Download, Share, X, ChevronUp as ArrowUpLine, ChevronDown as ArrowDownLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeMirror } from "@/components/code-mirror"
import { useCallback, useState, useRef, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { formatFileSize } from "@/lib/utils"
import { CodeMirrorSearchControls, SearchResult } from "@/types/code-mirror"
import { EditorView } from "@codemirror/view"
import { EditorSelection, StateEffect } from "@codemirror/state"

// Déclaration pour étendre l'interface Window
declare global {
  interface Window {
    cm?: EditorView; // L'instance CodeMirror
    cmSearchControls?: CodeMirrorSearchControls; // Les contrôles de recherche CodeMirror
  }
}

// Function to determine language mode based on file extension
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

// Function to escape special regex characters for search
function escapeRegExp(string: string): string {
  // Escape special characters that have meaning in regular expressions
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Global variable to store search controls
// Cette déclaration est maintenant dans types/code-mirror.d.ts

interface FileContentProps {
  content: string;
  path: string;
  size: number;
  lines: number;
}

// Définir l'effet de sélection
const selectEffect = StateEffect.define<EditorSelection>();

export function FileContent({ content = "", path = "", size = 0, lines = 0 }: FileContentProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentResultIndex, setCurrentResultIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const fileContentRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { scrollToLine } = useRepoData();
  const editorRef = useRef<EditorView | null>(null);

  // Reset search when file changes
  useEffect(() => {
    setSearchQuery("")
    setSearchResults([])
    setCurrentResultIndex(-1)
    setIsSearchOpen(false)

    // Create download link
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    
    // Clean up
    return () => URL.revokeObjectURL(url);
  }, [content, path])

  // Focus on search input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle search button click
  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(prev => !prev)
    
    // If closing search, reset
    if (isSearchOpen) {
      setSearchQuery("")
      if (window.cmSearchControls) {
        window.cmSearchControls.search("");
      }
      setSearchResults([])
    }
  }, [isSearchOpen])

  // Handle search input changes with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // Effacer le debounce existant
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Si la requête est vide, effacer les résultats immédiatement
    if (!newQuery.trim()) {
      setSearchResults([])
      if (window.cmSearchControls) {
        window.cmSearchControls.search("");
      }
      return;
    }
    
    // Définir un nouveau debounce
    debounceTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && window.cmSearchControls) {
        try {
          // Échapper les caractères spéciaux de RegExp pour éviter les erreurs
          const escapedQuery = escapeRegExp(newQuery);
          
          // Appliquer la recherche avec la requête échappée
          window.cmSearchControls.search(escapedQuery);
          
          // Récupérer les résultats immédiatement après la recherche
          const searchInfo = window.cmSearchControls.getSearchInfo();
          if (searchInfo && searchInfo.total > 0) {
            setSearchResults([searchInfo]);
            console.log("Résultats de recherche:", searchInfo);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Erreur lors de la recherche:", error);
          // En cas d'erreur, réinitialiser la recherche
          window.cmSearchControls.search("");
          setSearchResults([]);
        }
      }
    }, 300); // Délai de 300ms pour le debounce
  }, []);

  // Find previous occurrence
  const handlePrevResult = useCallback(() => {
    if (typeof window !== 'undefined' && window.cmSearchControls) {
      // Appliquer la navigation
      const searchInfo = window.cmSearchControls.findPrevious();
      if (searchInfo) {
        setSearchResults([searchInfo]);
      }
    }
  }, []);

  // Find next occurrence
  const handleNextResult = useCallback(() => {
    if (typeof window !== 'undefined' && window.cmSearchControls) {
      // Appliquer la navigation
      const searchInfo = window.cmSearchControls.findNext();
      if (searchInfo) {
        setSearchResults([searchInfo]);
      }
    }
  }, []);

  // Close search
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    if (window.cmSearchControls) {
      window.cmSearchControls.search("");
    }
  }, [])

  // Handle keydown on search input for navigation shortcuts
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Clear existing debounce and perform search immediately
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      if (typeof window !== 'undefined' && window.cmSearchControls) {
        try {
          // Effectue d'abord la recherche si nécessaire
          if (searchQuery && !searchResults.length) {
            // Échapper les caractères spéciaux de RegExp
            const escapedQuery = escapeRegExp(searchQuery);
            window.cmSearchControls.search(escapedQuery);
            const searchInfo = window.cmSearchControls.getSearchInfo();
            if (searchInfo) {
              setSearchResults([searchInfo]);
            }
          } else {
            // Sinon, navigue entre les résultats
            if (e.shiftKey) {
              // Naviguer vers le résultat précédent
              const searchInfo = window.cmSearchControls.findPrevious();
              if (searchInfo) {
                setSearchResults([searchInfo]);
              }
            } else {
              // Naviguer vers le résultat suivant
              const searchInfo = window.cmSearchControls.findNext();
              if (searchInfo) {
                setSearchResults([searchInfo]);
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors de la recherche ou navigation:", error);
          // En cas d'erreur, réinitialiser la recherche
          window.cmSearchControls.search("");
          setSearchResults([]);
        }
      }
    } else if (e.key === 'Escape') {
      handleCloseSearch();
    }
  }, [searchQuery, searchResults, handleCloseSearch]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Copy content
  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(content)
  }, [content])

  // Download file
  const handleDownloadClick = useCallback(() => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = path ? path.split("/").pop() || "file" : "file"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [content, path])

  // Fonction pour gérer le défilement
  const handleScroll = useCallback((line: number) => {
    if (!editorRef.current) return;

    try {
      const view = editorRef.current;
      const linePos = view.state.doc.line(line + 1);
      
      // Créer une sélection pour la ligne
      const selection = EditorSelection.create([
        EditorSelection.range(linePos.from, linePos.to)
      ]);
      
      // Appliquer la sélection et le défilement uniquement dans l'éditeur
      view.dispatch({
        selection,
        effects: [
          selectEffect.of(selection),
          EditorView.scrollIntoView(linePos.from, {
            y: "center",
            yMargin: 50
          })
        ]
      });

      // Ajouter la mise en surbrillance
      const lineElement = view.domAtPos(linePos.from).node.parentElement;
      if (lineElement) {
        lineElement.classList.add('highlighted-line');
        setTimeout(() => {
          lineElement.classList.remove('highlighted-line');
        }, 2000);
      }

    } catch (error) {
      // Silencieusement ignorer les erreurs
    }
  }, []);

  // Gestionnaire de messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'SCROLL_TO_LINE') return;
      
      const eventPath = event.data.filePath?.replace(/^src\//, '') || '';
      const currentPath = path.replace(/^src\//, '');

      if (eventPath === currentPath && typeof event.data.lineNumber === 'number') {
        handleScroll(event.data.lineNumber);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [path, handleScroll]);

  const languageMode = getLanguageModeForFile(path);

  return (
    <div className="border rounded-md overflow-hidden bg-background h-full flex flex-col">
      <div className="flex items-center justify-between border-b p-2 bg-muted/30">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{path || "Unnamed File"}</span>
          <span className="mx-2">·</span>
          <span>{lines} {lines === 1 ? "line" : "lines"}</span>
          <span className="mx-2">·</span>
          <span>{formatFileSize(size)}</span>
        </div>
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchClick}
                  className={isSearchOpen ? "bg-muted" : ""}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Search (Ctrl+F)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopyClick}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Copy content</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDownloadClick}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Download</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      {/* Zone de recherche */}
      {isSearchOpen && (
        <div className="flex items-center justify-between space-x-2 p-2 border-b bg-muted/20">
          <div className="relative flex-1 flex items-center">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Rechercher dans le fichier..."
              className="pl-9 pr-4 py-1 h-9 w-full rounded-md bg-background border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {currentResultIndex + 1}/{searchResults.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevResult}
                className="h-8 w-8"
                disabled={!searchResults.length}
              >
                <ArrowUpLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextResult}
                className="h-8 w-8"
                disabled={!searchResults.length}
              >
                <ArrowDownLine className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseSearch}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Contenu du fichier */}
      <div className="flex-1 overflow-hidden" ref={fileContentRef}>
        <CodeMirror
          key={path}
          value={content}
          height="100%"
          filename={path}
          onSearchToggle={setIsSearchOpen}
          editorRef={editorRef}
        />
      </div>
      
      <style jsx global>{`
        .highlighted-line {
          background-color: rgba(255, 255, 0, 0.1) !important;
          border-left: 3px solid #ffcc00 !important;
          animation: highlight-pulse 2s 1;
        }

        @keyframes highlight-pulse {
          0%, 100% { background-color: rgba(255, 255, 0, 0.1); }
          50% { background-color: rgba(255, 255, 0, 0.3); }
        }
      `}</style>
    </div>
  )
} 