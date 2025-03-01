"use client"

import { useRepoData } from "@/components/repo/RepoDataProvider"
import { Loader2, Search, Copy, Download, Share, X, ChevronUp as ArrowUpLine, ChevronDown as ArrowDownLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeMirror } from "@/components/code-mirror"
import { useCallback, useState, useRef, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { formatFileSize } from "@/lib/utils"
import { CodeMirrorSearchControls, SearchResult } from "@/types/code-mirror"

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

// Global variable to store search controls
// Cette déclaration est maintenant dans types/code-mirror.d.ts

interface FileContentProps {
  content: string;
  path: string;
  size: number;
  lines: number;
}

export function FileContent({ content = "", path = "", size = 0, lines = 0 }: FileContentProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset search when file changes
  useEffect(() => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults(null)
  }, [path])

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
      setSearchResults(null)
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
      setSearchResults(null);
      if (window.cmSearchControls) {
        window.cmSearchControls.search("");
      }
      return;
    }
    
    // Définir un nouveau debounce
    debounceTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && window.cmSearchControls) {
        // Appliquer la recherche
        window.cmSearchControls.search(newQuery);
        
        // Récupérer les résultats immédiatement après la recherche
        const results = window.cmSearchControls.getSearchInfo();
        if (results) {
          setSearchResults(results.total > 0 ? results : null);
          console.log("Résultats de recherche:", results);
        }
      }
    }, 300); // Délai de 300ms pour le debounce
  }, []);

  // Find previous occurrence
  const handlePrevResult = useCallback(() => {
    if (typeof window !== 'undefined' && window.cmSearchControls) {
      // Appliquer la navigation
      window.cmSearchControls.findPrevious();
      
      // Récupérer les informations de recherche après navigation
      setTimeout(() => {
        if (window.cmSearchControls) {
          const results = window.cmSearchControls.getSearchInfo();
          setSearchResults(results);
        }
      }, 50);
    }
  }, []);

  // Find next occurrence
  const handleNextResult = useCallback(() => {
    if (typeof window !== 'undefined' && window.cmSearchControls) {
      // Appliquer la navigation
      window.cmSearchControls.findNext();
      
      // Récupérer les informations de recherche après navigation
      setTimeout(() => {
        if (window.cmSearchControls) {
          const results = window.cmSearchControls.getSearchInfo();
          setSearchResults(results);
        }
      }, 50);
    }
  }, []);

  // Close search
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults(null)
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
        // Effectue d'abord la recherche si nécessaire
        if (searchQuery && !searchResults) {
          window.cmSearchControls.search(searchQuery);
          const results = window.cmSearchControls.getSearchInfo();
          setSearchResults(results);
        } else {
          // Sinon, navigue entre les résultats
          if (e.shiftKey) {
            // Naviguer vers le résultat précédent
            window.cmSearchControls.findPrevious();
            // Récupérer les informations de recherche après navigation
            setTimeout(() => {
              if (window.cmSearchControls) {
                const results = window.cmSearchControls.getSearchInfo();
                setSearchResults(results);
              }
            }, 50);
          } else {
            // Naviguer vers le résultat suivant
            window.cmSearchControls.findNext();
            // Récupérer les informations de recherche après navigation
            setTimeout(() => {
              if (window.cmSearchControls) {
                const results = window.cmSearchControls.getSearchInfo();
                setSearchResults(results);
              }
            }, 50);
          }
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

  return (
    <div className="border rounded-md overflow-hidden bg-background h-full flex flex-col">
      <div className="flex items-center justify-between border-b p-2 bg-muted/30">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{path ? path.split("/").pop() : "Unnamed File"}</span>
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
          {searchResults && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {searchResults.current}/{searchResults.total}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevResult}
                className="h-8 w-8"
                disabled={!searchResults || searchResults.total === 0}
              >
                <ArrowUpLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextResult}
                className="h-8 w-8"
                disabled={!searchResults || searchResults.total === 0}
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
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          height="100%"
          filename={path}
          onSearchToggle={setIsSearchOpen}
        />
      </div>
    </div>
  )
} 