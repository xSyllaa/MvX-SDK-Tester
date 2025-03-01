"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    setIsRotating(true)
    setTheme(theme === "dark" ? "light" : "dark")
    
    // Réinitialiser l'état d'animation après la transition
    setTimeout(() => {
      setIsRotating(false)
    }, 500)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full h-8 w-8"
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all",
          theme === "dark" ? "opacity-0 scale-0" : "opacity-100 scale-100",
          isRotating && "animate-spin"
        )}
      />
      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] rotate-90 transition-all",
          theme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-0",
          isRotating && "animate-spin"
        )}
      />
    </Button>
  )
} 