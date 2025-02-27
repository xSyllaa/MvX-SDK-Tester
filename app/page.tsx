import Link from "next/link"
import { Search, ArrowRight, Code, Database, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
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
              <Link href="/components" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Components
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Analyze SDKs & ABIs with Precision
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The ultimate toolkit for developers to inspect, analyze and understand SDKs and ABIs.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search SDKs & ABIs or paste any github url"
                    className="w-full pl-8 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Try searching for popular SDKs or paste a GitHub repository URL
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/analyzer">
                  <Button className="font-mono">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="font-mono">
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Powerful SDK Analysis Tools</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">
                  Comprehensive tools to help you understand and work with SDKs and ABIs more efficiently.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">SDK Inspector</h3>
                <p className="text-center text-muted-foreground">
                  Deep dive into SDK structures and understand their implementation details.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">ABI Analyzer</h3>
                <p className="text-center text-muted-foreground">
                  Decode and analyze ABIs to understand contract interfaces and functionality.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Component Library</h3>
                <p className="text-center text-muted-foreground">
                  Reusable components to build and extend your applications with ease.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Powerful Analysis</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Understand any SDK or ABI in seconds
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Our analyzer breaks down complex SDKs and ABIs into understandable components, making development
                  faster and more efficient.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/analyzer">
                    <Button className="font-mono">
                      Try Analyzer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-4">
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Instant SDK Parsing</h3>
                      <p className="text-sm text-muted-foreground">
                        Parse and analyze any SDK from GitHub or direct upload in seconds.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">ABI Decoder</h3>
                      <p className="text-sm text-muted-foreground">
                        Decode complex ABIs into human-readable formats with detailed explanations.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Component Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Easily integrate analyzed components into your existing projects.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Start Analyzing Today</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Join developers who use MvX SDK Analyzer to streamline their development workflow.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search SDKs & ABIs or paste any github url"
                    className="w-full pl-8 font-mono text-sm"
                  />
                </div>
              </div>
              <Button size="lg" className="font-mono">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}

