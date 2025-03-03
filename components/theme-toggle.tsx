"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsRotating(true)
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full h-8 w-8 relative p-0 border-2 border-transparent hover:border-current"
    >
      <div className={cn(
        "w-full h-full flex items-center justify-center",
        isRotating && "animate-theme-toggle"
      )}>
        {!mounted ? (
          <Sun className="h-4 w-4" />
        ) : (
          <>
            <Sun
              className={cn(
                "h-4 w-4 transition-all",
                resolvedTheme === "dark" ? "opacity-0 scale-0" : "opacity-100 scale-100"
              )}
            />
            <Moon
              className={cn(
                "absolute h-4 w-4 transition-all",
                resolvedTheme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </>
        )}
      </div>
    </Button>
  )
} 