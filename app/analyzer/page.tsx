"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SDKCard } from "@/components/sdk-card"
import { sdkList, type SDK, tagCategoryColors } from "@/data/sdks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGithubClone } from "@/app/hooks/useGithubClone"
import { useRouter } from "next/navigation"

export default function AnalyzerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { cloneRepository, isLoading, error } = useGithubClone()
  const router = useRouter()

  const filteredSDKs = sdkList.filter(
    (sdk) =>
      sdk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sdk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sdk.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAnalyze = (sdk: SDK) => {
    const repoPath = extractRepoPath(sdk.github_link)
    if (repoPath) {
      router.push(`/analyzer/${encodeURIComponent(repoPath)}`)
    }
  }

  const handleGithubUrl = async (url: string) => {
    if (url.includes('github.com')) {
      const result = await cloneRepository(url)
      if (result.success) {
        console.log('Dépôt cloné avec succès:', result.data)
      } else {
        console.error('Erreur de clonage:', result.error)
        // Vous pouvez ajouter ici une notification d'erreur pour l'utilisateur
        // par exemple avec un toast ou une alerte
      }
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.includes('github.com')) {
      const repoPath = extractRepoPath(value)
      if (repoPath) {
        router.push(`/analyzer/${encodeURIComponent(repoPath)}`)
      }
    }
  }

  const extractRepoPath = (url: string): string | null => {
    try {
      const urlPattern = /github\.com\/([^\/]+\/[^\/]+)/
      const matches = url.match(urlPattern)
      return matches ? matches[1].replace('.git', '') : null
    } catch {
      return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-mono">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex w-full justify-between items-center gap-6 md:gap-10">
            <Link href="/" className="font-bold text-xl tracking-tight">
              MvX SDK Analyzer
            </Link>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SDKs & ABIs or paste any github url"
                className="w-full pl-8 font-mono text-sm bg-background border-muted"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/analyzer" className="transition-colors hover:text-foreground/80 text-foreground">
                Analyzer
              </Link>
              <Link href="/components" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Components
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter mb-4">SDK Analyzer</h1>
            <p className="text-muted-foreground max-w-[700px]">
              Browse and analyze MultiversX SDKs or search for a specific SDK by name, description, or tags.
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SDKs by name, description, or tags"
                className="w-full pl-8 font-mono text-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {filteredSDKs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSDKs.map((sdk) => (
                <SDKCard 
                  key={sdk.name} 
                  sdk={sdk} 
                  onAnalyze={() => handleAnalyze(sdk)}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No SDKs match your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

