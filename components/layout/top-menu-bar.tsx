"use client"

import { useState, KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TopMenuBar() {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  
  // Fonction pour gérer la recherche
  const handleSearch = () => {
    if (!searchText.trim()) return
    
    // Vérifie si c'est une URL GitHub
    if (searchText.includes("github.com")) {
      try {
        // Extraction du chemin du dépôt de l'URL
        const url = new URL(searchText)
        const path = url.pathname
          .replace(/^\//, "") // Enlever le premier slash
          .replace(/\/$/, "") // Enlever le dernier slash
        
        if (path) {
          router.push(`/analyzer/${encodeURIComponent(path)}`)
          return
        }
      } catch (e) {
        // Si l'URL n'est pas valide, on continue avec la recherche normale
        console.error("URL invalide:", e)
      }
    }
    
    // Pour les autres textes de recherche (à implémenter)
    router.push(`/search?q=${encodeURIComponent(searchText)}`)
  }
  
  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex w-full justify-between items-center gap-6 md:gap-10">
          <Link href="/" className="font-bold text-xl tracking-tight">
            MvX SDK Analyzer
          </Link>

          <div className="relative w-full max-w-md">
            <Search 
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
              onClick={handleSearch}
            />
            <Input
              type="search"
              placeholder="Search SDKs & ABIs or paste any github url"
              className="w-full pl-8 font-mono text-sm bg-background border-muted"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/analyzer" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Analyzer
            </Link>
            <Link href="/key-components" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Key Components
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 