import Link from "next/link"
import { ArrowLeft, Search, Package, Code, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ComponentsPage() {
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
              />
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/analyzer" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Analyzer
              </Link>
              <Link href="/components" className="transition-colors hover:text-foreground/80 text-foreground">
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
            <h1 className="text-3xl font-bold tracking-tighter mb-4">Component Library</h1>
            <p className="text-muted-foreground max-w-[700px]">
              Browse and use our collection of reusable components for building SDK-powered applications.
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search components" className="w-full pl-8 font-mono text-sm" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-6 space-y-4">
              <div className="rounded-full bg-primary/10 p-3 w-fit">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">SDK Viewer</h2>
              <p className="text-muted-foreground">Interactive component for viewing and exploring SDK structures.</p>
              <Button variant="outline" className="w-full font-mono">
                View Component
              </Button>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
              <div className="rounded-full bg-primary/10 p-3 w-fit">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Code Explorer</h2>
              <p className="text-muted-foreground">Advanced code explorer with syntax highlighting and navigation.</p>
              <Button variant="outline" className="w-full font-mono">
                View Component
              </Button>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
              <div className="rounded-full bg-primary/10 p-3 w-fit">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">ABI Inspector</h2>
              <p className="text-muted-foreground">Visual inspector for ABIs with function and event details.</p>
              <Button variant="outline" className="w-full font-mono">
                View Component
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-xs text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} MvX SDK Analyzer. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="/docs" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

