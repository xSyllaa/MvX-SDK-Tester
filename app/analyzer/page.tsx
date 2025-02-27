"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SDKCard } from "@/components/sdk-card"
import { sdkList, type SDK, tagCategoryColors } from "@/data/sdks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AnalyzerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSDK, setSelectedSDK] = useState<SDK | null>(null)

  const filteredSDKs = sdkList.filter(
    (sdk) =>
      sdk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sdk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sdk.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAnalyze = (sdk: SDK) => {
    setSelectedSDK(sdk)
    // In a real app, this would trigger the analysis process
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {selectedSDK && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>SDK: {selectedSDK.name}</AlertTitle>
              <AlertDescription>
                View details, documentation and code examples for this SDK.
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Tag Categories</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tagCategoryColors).map(([category, color]) => (
                <div key={category} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: color }}></div>
                  <span className="text-sm">{category}</span>
                </div>
              ))}
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

