"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { tagCategoryColors, type SDK, type TagCategory } from "@/data/sdkData"

interface SDKCardProps {
  sdk: SDK
  onAnalyze: (sdk: SDK) => void
}

const getContrastColor = (hexColor: string) => {
  // Check if hexColor is undefined or not a valid hex color
  if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
    return "#000000" // Default to black text
  }

  // Convert hex to RGB
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

export function SDKCard({ sdk, onAnalyze }: SDKCardProps) {
  const router = useRouter()

  const handleAnalyze = () => {
    // Extract the repository name from the GitHub URL and encode it
    const repoPath = sdk.github_link
      .replace("https://github.com/", "")
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("%2F")
    router.push(`/analyzer/${repoPath}`)
  }

  return (
    <div className="border rounded-lg p-6 space-y-4 hover:border-primary/20 transition-colors">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold">{sdk.name}</h3>
        <Link
          href={sdk.github_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub Repository</span>
        </Link>
      </div>

      <p className="text-muted-foreground text-sm">{sdk.description}</p>

      <div className="flex flex-wrap gap-2">
        {sdk.tags.map((tag) => {
          const bgColor = tagCategoryColors[tag.category] || "#e5e7eb"
          return (
            <Badge
              key={tag.name}
              variant="outline"
              className="font-mono text-xs text-foreground"
              style={{
                backgroundColor: `${bgColor}40`, // 40 is for 25% opacity
                borderColor: bgColor,
              }}
            >
              {tag.name}
            </Badge>
          )
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="default" size="sm" className="font-mono text-xs" onClick={handleAnalyze}>
          Analyze SDK
        </Button>
        <Link href={sdk.github_link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="font-mono text-xs">
            View on GitHub
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

