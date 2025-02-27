"use client"

import { useState, KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu } from "lucide-react"
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
          {/* Version mobile: titre à gauche, menu à droite */}
          <div className="flex w-full items-center md:hidden">
            <Link href="/" className="font-bold text-xl tracking-tight whitespace-nowrap">
              MvX SDK Analyzer
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Version desktop: 3 colonnes */}
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr] w-full items-center gap-4">
            {/* 1. Partie gauche - Logo */}
            <div className="flex justify-start">
              <Link href="/" className="font-bold text-xl tracking-tight whitespace-nowrap">
                MvX SDK Analyzer
              </Link>
            </div>
            
            {/* 2. Partie centrale - Recherche */}
            <div className="flex justify-center w-full">
              <div className="relative w-full">
                <Search 
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
                  onClick={handleSearch}
                />
                <Input
                  type="search"
                  placeholder="Search SDKs & ABIs or paste any github url"
                  className="w-full pl-8 font-mono text-sm bg-background border border-input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            
            {/* 3. Partie droite - Navigation */}
            <div className="flex justify-end">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/analyzer" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Analyzer
                </Link>
                <Link href="/key-components" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Components
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      {/* Menu mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-background md:hidden border-b shadow-md">
          <div className="container flex flex-col">
            <div className="py-4 px-4">
              <div className="relative w-full mb-6">
                <Search 
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
                  onClick={handleSearch}
                />
                <Input
                  type="search"
                  placeholder="Search SDKs & ABIs or paste any github url"
                  className="w-full pl-8 font-mono text-sm bg-background border border-input"
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