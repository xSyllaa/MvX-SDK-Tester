"use client";

import Link from "next/link"
import { ArrowLeft, Search, Package, Code, Database, PlusCircle, Filter, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

// Sample component data
const demoComponents = [
  {
    id: 1,
    title: "SDK Viewer",
    description: "Interactive component for viewing and exploring SDK structures with syntax highlighting.",
    category: "UI",
    author: "Alice Developer",
    tags: ["SDK", "Viewer", "TypeScript"],
    downloads: 1689,
    createdAt: "2023-09-14",
    icon: <Package className="h-6 w-6 text-primary" />
  },
  {
    id: 2,
    title: "Code Explorer",
    description: "Advanced code explorer with syntax highlighting and navigation for MultiversX smart contracts.",
    category: "Tools",
    author: "Bob Engineer",
    tags: ["Code", "Explorer", "UI"],
    downloads: 982,
    createdAt: "2023-10-25",
    icon: <Code className="h-6 w-6 text-primary" />
  },
  {
    id: 3,
    title: "ABI Inspector",
    description: "Visual inspector for ABIs with function and event details. Supports multiple formats and networks.",
    category: "Tools",
    author: "Charlie Coder",
    tags: ["ABI", "Inspector", "React"],
    downloads: 2345,
    createdAt: "2023-08-03",
    icon: <Database className="h-6 w-6 text-primary" />
  },
  {
    id: 4,
    title: "Transaction Builder",
    description: "A complete transaction builder for MultiversX with fee estimation and gas calculations.",
    category: "SDK",
    author: "Diana DevOps",
    tags: ["Transaction", "Builder", "MultiversX"],
    downloads: 1123,
    createdAt: "2023-11-12",
    icon: <Code className="h-6 w-6 text-primary" />
  }
];

export default function ComponentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Filter components based on search query and category
  const filteredComponents = demoComponents.filter(component => {
    const matchesSearch = component.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || component.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

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

        {/* Tabs for Component Library */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Components</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {filteredComponents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredComponents.map((component) => (
                  <Card key={component.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-3">
                        {component.icon}
                      </div>
                      <CardTitle>{component.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {component.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {component.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">By {component.author}</span>
                        <span className="text-muted-foreground">{component.downloads} downloads</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <Button variant="default" className="w-full font-mono">
                        View Component
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No components found. Try a different search term.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...demoComponents]
                .sort((a, b) => b.downloads - a.downloads)
                .map((component) => (
                  <Card key={component.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-3">
                        {component.icon}
                      </div>
                      <CardTitle>{component.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {component.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {component.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">By {component.author}</span>
                        <span className="text-muted-foreground">{component.downloads} downloads</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <Button variant="default" className="w-full font-mono">
                        View Component
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...demoComponents]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((component) => (
                  <Card key={component.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-3">
                        {component.icon}
                      </div>
                      <CardTitle>{component.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {component.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {component.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">By {component.author}</span>
                        <span className="text-muted-foreground">{component.downloads} downloads</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <Button variant="default" className="w-full font-mono">
                        View Component
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

    </div>
  )
}

