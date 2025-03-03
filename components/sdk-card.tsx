"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { tagCategoryColors, TagCategory, tagCategoryDescriptions, type SDK, sortTagsByPriority } from "@/data/sdkData"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    <div className="border rounded-lg p-4 lg:p-6 hover:border-primary/20 transition-colors h-full flex flex-col">
      <div className="flex justify-between items-start gap-4 mb-3 lg:mb-4">
        <h3 className="text-base lg:text-lg font-bold">{sdk.name}</h3>
        <Link
          href={sdk.github_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <Github className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="sr-only">GitHub Repository</span>
        </Link>
      </div>

      <p className="text-muted-foreground text-xs lg:text-sm mb-4">{sdk.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <TooltipProvider delayDuration={0}>
          {sortTagsByPriority(sdk.tags).map((tag) => {
            const colors = tagCategoryColors[tag.category]
            return (
              <Tooltip key={tag.name}>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className="text-[10px] lg:text-xs py-1 px-2.5 whitespace-normal break-words min-h-[20px] cursor-help font-medium"
                    style={{
                      backgroundColor: colors.light,
                      borderColor: colors.base,
                      color: colors.base
                    }}
                  >
                    {tag.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center"
                  className="border-2"
                  style={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: colors.base,
                    color: "inherit"
                  }}
                >
                  <p className="text-xs">{tag.category} - {tagCategoryDescriptions[tag.category]}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-2 w-full mt-auto sm:flex-wrap">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 text-[10px] lg:text-xs py-1.5 h-auto min-h-[28px] font-mono whitespace-nowrap"
          onClick={handleAnalyze}
        >
          Analyze SDK
        </Button>
        <Link 
          href={sdk.github_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex-1"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-[10px] lg:text-xs py-1.5 h-auto min-h-[28px] font-mono inline-flex items-center justify-center whitespace-nowrap"
          >
            View on GitHub
            <ExternalLink className="ml-1.5 h-3 w-3 shrink-0" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

