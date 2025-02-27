"use client"

import { useState, KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TopMenuBar() {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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

  // Basculer l'état du menu mobile
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      {/* Barre principale */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex w-full justify-between items-center">
            <Link href="/" className="font-bold text-xl tracking-tight">
              MvX SDK Analyzer
            </Link>
            
            {/* Navigation desktop uniquement */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <div className="relative max-w-md">
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
              <Link href="/analyzer" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Analyzer
              </Link>
              <Link href="/key-components" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Components
              </Link>
            </nav>
            
            {/* Bouton menu mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Menu mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-background md:hidden border-b shadow-md">
          <div className="container flex flex-col">
            <div className="py-4 px-4">
              <div className="relative mb-6">
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
              
              <div className="flex flex-col space-y-4 pb-4">
                <Link 
                  href="/analyzer" 
                  className="py-2 text-lg transition-colors hover:text-foreground/80"
                  onClick={toggleMobileMenu}
                >
                  Analyzer
                </Link>
                <Link 
                  href="/key-components" 
                  className="py-2 text-lg transition-colors hover:text-foreground/80"
                  onClick={toggleMobileMenu}
                >
                  Components
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 