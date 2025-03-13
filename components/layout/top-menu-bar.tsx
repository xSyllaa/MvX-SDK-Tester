"use client"

import { useState, KeyboardEvent, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { ConnectWallet } from "@/components/wallet/connect-wallet"

// Composant de lien animé avec une barre qui se remplit au hover
function AnimatedLink({ 
  href, 
  children, 
  className,
  onClick,
  active = false
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Variantes pour l'animation de la barre
  const barVariants = {
    initial: { 
      width: 0,
      left: "100%"
    },
    enter: { 
      width: "100%", 
      left: 0,
      transition: { 
        width: { duration: 0.4, ease: [0.65, 0, 0.35, 1] },
        left: { duration: 0 } 
      }
    },
    exit: { 
      width: 0,
      left: "100%",
      transition: { 
        width: { duration: 0.3, ease: "easeInOut" }, 
        left: { duration: 0.3, ease: "easeInOut" } 
      }
    }
  };
  
  // Gérer les événements de souris de manière plus robuste
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  return (
    <Link 
      href={href} 
      className={`relative group flex flex-col items-center justify-center ${className || ""}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={`transition-colors duration-300 ${active ? 'text-foreground font-medium' : 'group-hover:text-foreground text-foreground/60'}`}>
        {children}
      </span>
      <div className="absolute -bottom-1 left-0 w-full h-[2.5px] overflow-hidden">
        <AnimatePresence>
          {(isHovered || active) && (
            <motion.div
              className="absolute top-0 left-0 h-full bg-foreground rounded-sm shadow-glow"
              initial="initial"
              animate="enter"
              exit="exit"
              variants={barVariants}
            />
          )}
        </AnimatePresence>
      </div>
    </Link>
  );
}

export function TopMenuBar() {
  const router = useRouter()
  const pathname = usePathname()
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

  // Déterminer le chemin actuel pour mettre en surbrillance le lien actif
  const isActive = (path: string): boolean => {
    if (!pathname) return false;
    return pathname.startsWith(path);
  };

  return (
    <>
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      
      {/* Barre principale */}
      <header className="sticky top-0 z-10 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          {/* Version mobile: titre à gauche, menu à droite */}
          <div className="flex w-full items-center md:hidden">
            <Link href="/" className="font-bold text-xl tracking-tight whitespace-nowrap">
              MvXLib
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <ConnectWallet />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Version desktop: 3 colonnes */}
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr] w-full items-center gap-4">
            {/* 1. Partie gauche - Logo */}
            <div className="flex justify-start">
              <Link href="/" className="font-bold text-xl tracking-tight whitespace-nowrap">
                MvXLib
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
            <div className="flex justify-end items-center">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <AnimatedLink href="/analyzer" active={isActive('/analyzer')}>
                  Analyzer
                </AnimatedLink>
                <AnimatedLink href="/key-components" active={isActive('/key-components')}>
                  Components
                </AnimatedLink>
                <AnimatedLink href="/roadmap" active={isActive('/roadmap')}>
                  Roadmap
                </AnimatedLink>
              </nav>
              <div className="ml-6 flex items-center gap-2">
                <ConnectWallet />
                <ThemeToggle />
              </div>
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
                <AnimatedLink 
                  href="/analyzer" 
                  className="py-2 text-lg"
                  onClick={toggleMobileMenu}
                  active={isActive('/analyzer')}
                >
                  Analyzer
                </AnimatedLink>
                <AnimatedLink 
                  href="/key-components" 
                  className="py-2 text-lg"
                  onClick={toggleMobileMenu}
                  active={isActive('/key-components')}
                >
                  Components
                </AnimatedLink>
                <AnimatedLink 
                  href="/roadmap" 
                  className="py-2 text-lg"
                  onClick={toggleMobileMenu}
                  active={isActive('/roadmap')}
                >
                  Roadmap
                </AnimatedLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 