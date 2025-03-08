"use client";

import Link from "next/link"
import { ArrowLeft, Search, Package, Code, Database, PlusCircle, Filter, Sparkles, Github, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Type pour les composants
interface Component {
  id: string;
  title: string;
  description: string;
  category: string;
  github_url: string;
  tags: string[];
  is_public: boolean;
  author_id?: string;
  created_at: string;
  updated_at: string;
  status: string;
  downloads: number;
  is_reviewed: boolean;
}

export default function ComponentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les composants au chargement de la page
  useEffect(() => {
    async function fetchComponents() {
      try {
        setIsLoading(true);
        setError(null);

        // Par défaut, nous récupérons les composants approuvés (status=approved) et avec is_reviewed=true
        const response = await fetch('/api/components?status=approved&isReviewed=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch components');
        }
        
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error('Error fetching components:', error);
        setError('Failed to load components. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchComponents();
  }, []);
  
  // Filtrer les composants en fonction de la recherche et de la catégorie
  const filteredComponents = components.filter(component => {
    const matchesSearch = 
      component.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || component.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Fonction pour rendre une carte de composant
  const renderComponentCard = (component: Component) => {
    return (
      <Card key={component.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="rounded-full bg-primary/10 p-3 w-fit mb-3">
            {component.category === 'ui' ? (
              <Package className="h-6 w-6 text-primary" />
            ) : component.category === 'sdk' ? (
              <Code className="h-6 w-6 text-primary" />
            ) : (
              <Database className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>{component.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {component.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {component.tags.map((tag, index) => (
              <Badge key={`${component.id}-${tag}-${index}`} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">By Community Member</span>
            <span className="text-muted-foreground">{component.downloads} downloads</span>
          </div>
          {component.github_url && (
            <div className="pt-2 text-sm">
              <span className="text-muted-foreground">Source: </span>
              <Link 
                href={component.github_url.startsWith('http') ? component.github_url : `https://github.com/${component.github_url}`} 
                target="_blank" 
                className="text-primary hover:underline truncate inline-block max-w-full"
              >
                {component.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 border-t">
          <div className="flex gap-2 w-full">
            <Button variant="default" className="flex-1">
              View Component
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link 
                href={component.github_url.startsWith('http') ? component.github_url : `https://github.com/${component.github_url}`} 
                target="_blank"
              >
                <Github className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen font-mono">
     

      <main className="flex-1 container py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section with Submit CTA */}
        <div className="rounded-xl border bg-card p-8 shadow-sm mb-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter">Component Library</h1>
              <p className="text-muted-foreground max-w-[500px]">
                Discover and utilize reusable components created by the MultiversX community to accelerate your development.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Button 
                  className="font-mono" 
                  onClick={() => router.push('/components/submit')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit Your Component
                </Button>
                <Button variant="outline" className="font-mono">
                  <Filter className="mr-2 h-4 w-4" />
                  Browse All
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/5 rounded-full"></div>
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-primary/10 rounded-full"></div>
                <div className="relative p-6 bg-card rounded-xl border shadow-sm flex flex-col items-center justify-center gap-4 min-h-[240px] w-[320px]">
                  <Sparkles className="h-16 w-16 text-primary opacity-80" />
                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg">Share Your Work</h3>
                    <p className="text-sm text-muted-foreground">
                      Contribute to the community by sharing your reusable components
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 items-start mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search components, tags, or keywords" 
              className="w-full pl-8 font-mono text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ui">UI Components</SelectItem>
              <SelectItem value="sdk">SDK Utilities</SelectItem>
              <SelectItem value="tools">Developer Tools</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Component Cards Section */}
        <div className="space-y-10">
          {/* Featured Components Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Featured Components</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Template Component Card */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>SDK Viewer</CardTitle>
                  <CardDescription className="line-clamp-2">
                    Interactive component for viewing and exploring MultiversX SDK structures with syntax highlighting and advanced navigation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">SDK</Badge>
                    <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                    <Badge variant="secondary" className="text-xs">Viewer</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">By Alice Developer</span>
                    <span className="text-muted-foreground">1,689 downloads</span>
                  </div>
                  <div className="pt-2 text-sm">
                    <span className="text-muted-foreground">Source: </span>
                    <Link href="https://github.com/example/sdk-viewer" target="_blank" className="text-primary hover:underline truncate inline-block max-w-full">
                      example/sdk-viewer
                    </Link>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t">
                  <div className="flex gap-2 w-full">
                    <Button variant="default" className="flex-1">
                      View Component
                    </Button>
                    <Button variant="outline" size="icon">
                      <Github className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Submit Your Component Card */}
              <Card className="overflow-hidden border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <PlusCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Share Your Component</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Have you built a useful component for the MultiversX ecosystem? Share it with the community and help other developers accelerate their projects.
                  </p>
                  <Button 
                    onClick={() => router.push('/components/submit')}
                    className="w-full max-w-[200px]"
                  >
                    Submit Component
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Community Components Section */}
          {filteredComponents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Community Components</h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading components...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredComponents.map(component => renderComponentCard(component))}
                </div>
              )}
            </div>
          )}

          {/* Coming Soon Section - only show if no community components */}
          {!isLoading && !error && filteredComponents.length === 0 && (
            <div className="mt-16 text-center">
              <Badge variant="outline" className="mb-4">Coming Soon</Badge>
              <h2 className="text-2xl font-bold mb-3">More Components On The Way</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                We're working on expanding our component library. Stay tuned for more reusable components and tools to help you build better MultiversX applications.
              </p>
              <div className="grid grid-cols-3 max-w-3xl mx-auto gap-4 mb-8">
                <div className="bg-muted/30 rounded-lg p-4 aspect-video flex items-center justify-center">
                  <span className="text-muted-foreground">Coming soon</span>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 aspect-video flex items-center justify-center">
                  <span className="text-muted-foreground">Coming soon</span>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 aspect-video flex items-center justify-center">
                  <span className="text-muted-foreground">Coming soon</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}

