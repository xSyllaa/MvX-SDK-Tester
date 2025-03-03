"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsRotating(true)
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    
    // Réinitialiser l'état d'animation après la transition
    setTimeout(() => {
      setIsRotating(false)
    }, 500) // Durée correspondant à notre animation
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Toggle theme"
      className="rounded-full h-8 w-8 relative p-0 overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "transition-all duration-500 ease-in-out",
              isHovered ? "stroke-dasharray-0" : "stroke-dasharray-301"
            )}
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
              strokeDasharray: '301',
              strokeDashoffset: isHovered ? '0' : '301'
            }}
          />
        </svg>
      </div>
      <div className={cn(
        "w-full h-full flex items-center justify-center",
        isRotating && "animate-theme-toggle"
      )}>
        {/* Afficher une icône par défaut avant le montage du client */}
        {!mounted ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <>
            <Sun
              className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all duration-300",
                resolvedTheme === "dark" ? "opacity-0 scale-0" : "opacity-100 scale-100"
              )}
            />
            <Moon
              className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
                resolvedTheme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </>
        )}
      </div>
    </Button>
  )
} 