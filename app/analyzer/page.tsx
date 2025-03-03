"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, X, Filter, Tag as TagIcon, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SDKCard } from "@/components/sdk-card"
import { sdkList, type SDK, TagCategory, tagCategoryColors, type Tag, tagCategoryPriority } from "@/data/sdkData"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGithubClone } from "@/hooks/useGithubClone"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { generateHomeContext } from "@/lib/chat-context"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { useChat } from '@/components/chat/chat-provider'

// Icônes pour chaque catégorie
const CategoryIcons: Record<TagCategory, React.ReactNode> = {
  [TagCategory.LANGUAGE]: <TagIcon className="h-3.5 w-3.5" />,
  [TagCategory.PURPOSE]: <TagIcon className="h-3.5 w-3.5" />,
  [TagCategory.FRAMEWORK]: <TagIcon className="h-3.5 w-3.5" />,
  [TagCategory.PLATFORM]: <TagIcon className="h-3.5 w-3.5" />,
  [TagCategory.TECHNOLOGY]: <TagIcon className="h-3.5 w-3.5" />,
  [TagCategory.OTHER]: <TagIcon className="h-3.5 w-3.5" />,
  [TagCategory.OWNER]: <TagIcon className="h-3.5 w-3.5" />,
}

export default function AnalyzerPage() {
  const { setContext } = useChat();
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<{category: TagCategory, value: string}[]>([])
  const [activeCategory, setActiveCategory] = useState<TagCategory>(TagCategory.LANGUAGE)
  const [isOrMode, setIsOrMode] = useState(false) // false = AND mode, true = OR mode
  const { cloneRepository, isLoading, error } = useGithubClone()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Générer le contexte au chargement de la page
  useEffect(() => {
    const context = generateHomeContext();
    setContext(context);
  }, [setContext]);

  // Récupérer le paramètre search de l'URL au chargement
  useEffect(() => {
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
  }, [searchParams])

  // Calcul des occurrences pour chaque catégorie et valeur
  const { tagCategoriesAndValues, categoryCounts, valueCounts } = useMemo(() => {
    const categoryMap: Record<TagCategory, Set<string>> = Object.values(TagCategory).reduce((acc, category) => {
      acc[category] = new Set<string>()
      return acc
    }, {} as Record<TagCategory, Set<string>>)
    
    // Compteurs pour les catégories et les valeurs
    const categoryCountMap: Record<TagCategory, number> = Object.values(TagCategory).reduce((acc, category) => {
      acc[category] = 0
      return acc
    }, {} as Record<TagCategory, number>)
    
    const valueCountMap: Record<string, number> = {}
    
    // Parcourir tous les SDK pour compter les occurrences
    sdkList.forEach(sdk => {
      sdk.tags.forEach(tag => {
        categoryMap[tag.category].add(tag.name)
        
        // Incrémenter le compteur de la catégorie
        categoryCountMap[tag.category]++
        
        // Incrémenter le compteur de la valeur
        const valueKey = `${tag.category}:${tag.name}`
        valueCountMap[valueKey] = (valueCountMap[valueKey] || 0) + 1
      })
    })

    return {
      tagCategoriesAndValues: Object.entries(categoryMap).map(([category, valuesSet]) => ({
        category: category as TagCategory,
        values: Array.from(valuesSet).sort()
      })),
      categoryCounts: categoryCountMap,
      valueCounts: valueCountMap
    }
  }, [])

  // Obtenir les valeurs pour la catégorie active
  const activeValues = useMemo(() => {
    const categoryData = tagCategoriesAndValues.find(item => item.category === activeCategory)
    return categoryData ? categoryData.values : []
  }, [tagCategoriesAndValues, activeCategory])

  const filteredSDKs = useMemo(() => {
    return sdkList.filter(sdk => {
      // Filtre par recherche textuelle
      const matchesSearch = searchQuery === "" || 
        sdk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sdk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sdk.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Filtre par filtres actifs selon le mode (AND/OR)
      let matchesFilters = true;
      
      if (activeFilters.length > 0) {
        if (isOrMode) {
          // Mode OR: au moins un filtre doit correspondre
          matchesFilters = activeFilters.some(filter => 
            sdk.tags.some(tag => tag.category === filter.category && tag.name === filter.value)
          );
        } else {
          // Mode AND: tous les filtres doivent correspondre (comportement d'origine)
          matchesFilters = activeFilters.every(filter => 
            sdk.tags.some(tag => tag.category === filter.category && tag.name === filter.value)
          );
        }
      }

      return matchesSearch && matchesFilters
    })
  }, [searchQuery, activeFilters, isOrMode])

  const handleAddFilter = (category: TagCategory, value: string) => {
    if (!activeFilters.some(f => f.category === category && f.value === value)) {
      setActiveFilters([...activeFilters, { category, value }])
    }
  }

  const handleRemoveFilter = (category: TagCategory, value: string) => {
    setActiveFilters(activeFilters.filter(f => !(f.category === category && f.value === value)))
  }

  const handleAnalyze = (sdk: SDK) => {
    const repoPath = extractRepoPath(sdk.github_link)
    if (repoPath) {
      // Utiliser les informations du SDK pour les stocker dans le localStorage
      localStorage.setItem('currentSDK', JSON.stringify(sdk));
      localStorage.setItem('dataSource', 'preloaded');
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

  // Pour le rendu des catégories de filtres
  const sortedCategories = Object.values(TagCategory).sort(
    (a, b) => tagCategoryPriority[a] - tagCategoryPriority[b]
  );

  return (
    <div className="flex flex-col min-h-screen font-mono">
     
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

          {/* Chat Assistant */}
          <ChatInterface />

          {/* Zone de recherche */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SDKs by name, description, or tags"
                className="w-full pl-8 font-mono text-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            {activeFilters.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs whitespace-nowrap"
                onClick={() => setActiveFilters([])}
              >
                Clear All Filters ({activeFilters.length})
              </Button>
            )}
          </div>

          {/* Section de filtrage */}
          <Card className="border rounded-lg overflow-hidden bg-background">
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
              
              {/* Ligne de catégories */}
              <div className="flex flex-wrap gap-2">
                {sortedCategories.map(category => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 h-8 transition-all hover:opacity-90"
                    style={activeCategory === category ? 
                      { backgroundColor: tagCategoryColors[category].base, color: "white" } : 
                      { 
                        backgroundColor: tagCategoryColors[category].light, 
                        borderColor: tagCategoryColors[category].base, 
                        color: "inherit" 
                      }
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: activeCategory === category ? "white" : tagCategoryColors[category].base }}
                    />
                    <span>{category}</span>
                    <span className="ml-1.5 text-xs opacity-70 font-normal">
                      ({categoryCounts[category]})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Valeurs de la catégorie active */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">{activeCategory}</h4>
                <span className="text-xs text-muted-foreground">{activeValues.length} options</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeValues.map(value => {
                  const isActive = activeFilters.some(f => f.category === activeCategory && f.value === value);
                  const valueKey = `${activeCategory}:${value}`;
                  const count = valueCounts[valueKey] || 0;
                  
                  return (
                    <Badge
                      key={`${activeCategory}-${value}`}
                      variant={isActive ? "default" : "outline"}
                      className={`cursor-pointer transition-all py-1.5 px-2.5 ${
                        isActive 
                          ? "hover:opacity-90" 
                          : "hover:border-primary hover:text-primary"
                      }`}
                      style={{ 
                        backgroundColor: isActive ? tagCategoryColors[activeCategory].base : tagCategoryColors[activeCategory].light,
                        borderColor: tagCategoryColors[activeCategory].base,
                        color: isActive ? "white" : "inherit"
                      }}
                      onClick={() => isActive 
                        ? handleRemoveFilter(activeCategory, value) 
                        : handleAddFilter(activeCategory, value)
                      }
                    >
                      {isActive && (
                        <Check className="h-3 w-3 mr-1 stroke-[3]" />
                      )}
                      <span className="text-xs">{value}</span>
                      <span className="ml-1.5 text-xs opacity-70">({count})</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Filtres actifs - déplacés sous la zone de choix */}
            {activeFilters.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h4 className="text-sm font-medium">Active Filters</h4>
                    
                    {/* Toggle AND/OR */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={!isOrMode ? "font-medium" : "text-muted-foreground"}>AND</span>
                      <Switch 
                        checked={isOrMode} 
                        onCheckedChange={setIsOrMode} 
                        className="data-[state=checked]:bg-primary" 
                      />
                      <span className={isOrMode ? "font-medium" : "text-muted-foreground"}>OR</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setActiveFilters([])}
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map(filter => (
                    <Badge 
                      key={`${filter.category}-${filter.value}`}
                      variant="default"
                      className="flex items-center gap-1 py-1.5 px-2 transition-all hover:opacity-90"
                      style={{ 
                        backgroundColor: tagCategoryColors[filter.category].base,
                        color: "white"
                      }}
                    >
                      <span className="text-xs">{filter.value}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent opacity-80 hover:opacity-100"
                        onClick={() => handleRemoveFilter(filter.category, filter.value)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Résultats */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Results <span className="text-muted-foreground">({filteredSDKs.length})</span></h2>
            </div>

            {filteredSDKs.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
        </div>
      </main>
    </div>
  )
}
