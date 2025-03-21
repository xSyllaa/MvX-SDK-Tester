"use client";

import Link from "next/link"
import { Search, ArrowRight, Code, Database, Layers, Share2, Plus, Users, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PitchDeck } from "@/app/components/PitchDeck"
import { WaitlistForm } from "@/app/components/WaitlistForm"
import { SubscriptionPlanType } from "@/lib/subscription-plans"

// Composant pour animer les sections au défilement
function AnimatedSection({ children, className, delay = 0 }: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter();
  const [topSearchQuery, setTopSearchQuery] = useState("");
  const [bottomSearchQuery, setBottomSearchQuery] = useState("");
  
  // Effet pour charger le script Twitter
  useEffect(() => {
    // Fonction pour charger le script Twitter
    const loadTwitterWidget = () => {
      // Supprimer le script existant s'il y en a un
      const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Créer et ajouter le nouveau script
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
    };
    
    // Charger le widget Twitter
    loadTwitterWidget();
    
    // Nettoyer lors du démontage du composant
    return () => {
      const script = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);
  
  // Effet pour nettoyer les classes problématiques
  useEffect(() => {
    // Supprimer les classes Chakra UI qui causent des erreurs d'hydratation
    const body = document.body;
    if (body.classList.contains('chakra-ui-light')) {
      body.classList.remove('chakra-ui-light');
    }
    
    // Supprimer les styles inline qui peuvent causer des erreurs
    if (body.style.paddingRight) {
      body.style.paddingRight = '';
    }
  }, []);
  
  // Fonction pour naviguer vers la page analyzer avec le terme de recherche
  const navigateToAnalyzer = (searchTerm: string = "") => {
    if (searchTerm.trim()) {
      router.push(`/analyzer?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/analyzer');
    }
  };
  
  // Gestionnaire pour l'icône de recherche en haut
  const handleTopSearch = () => {
    navigateToAnalyzer(topSearchQuery);
  };
  
  // Gestionnaire pour l'icône de recherche en bas
  const handleBottomSearch = () => {
    navigateToAnalyzer(bottomSearchQuery);
  };
  
  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent, searchQuery: string) => {
    if (e.key === "Enter") {
      navigateToAnalyzer(searchQuery);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-mono">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <AnimatedSection>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Analyze MvX SDKs & ABIs with Precision
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    The ultimate toolkit for MultiversX developers to inspect, analyze and understand SDKs and ABIs.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="w-full max-w-md space-y-2">
                  <div className="relative">
                    <Search 
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
                      onClick={handleTopSearch}
                    />
                    <Input
                      type="search"
                      placeholder="Search SDKs & ABIs or paste any github url"
                      className="w-full pl-8 font-mono text-sm"
                      value={topSearchQuery}
                      onChange={(e) => setTopSearchQuery(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, topSearchQuery)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Try searching for popular SDKs or paste a GitHub repository URL
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.4}>
                <div className="space-x-4">
                  <Button 
                    className="font-mono"
                    onClick={() => navigateToAnalyzer(topSearchQuery)}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="font-mono">
                    View Documentation
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <AnimatedSection>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Powerful SDK Analysis Tools</h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground">
                    Comprehensive tools to help you understand and work with SDKs and ABIs more efficiently.
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <div className="mx-auto grid max-w-[2000px] items-center gap-6 py-12 lg:grid-cols-3">
              <AnimatedSection delay={0.1}>
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">SDK Inspector</h3>
                  <p className="text-center text-muted-foreground">
                    Deep dive into SDK structures and understand their implementation details.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">ABI Analyzer</h3>
                  <p className="text-center text-muted-foreground">
                    Decode and analyze ABIs to understand contract interfaces and functionality.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Component Library</h3>
                  <p className="text-center text-muted-foreground">
                    Reusable components to build and extend your applications with ease.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <div className="grid gap-10 md:gap-16 lg:grid-cols-2">
              <AnimatedSection>
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
                    <Button 
                      className="font-mono"
                      onClick={() => router.push('/analyzer')}
                    >
                      Try Analyzer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-4">
                  <AnimatedSection delay={0.1}>
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
                  </AnimatedSection>
                  <AnimatedSection delay={0.2}>
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
                  </AnimatedSection>
                  <AnimatedSection delay={0.3}>
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
                  </AnimatedSection>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/40 to-background">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-4">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-foreground font-medium">New Feature</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                  Community Component Library
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Discover, share, and reuse components built by the MultiversX community to accelerate your development workflow.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <AnimatedSection delay={0.1}>
                <div className="flex flex-col h-full p-6 bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Share Components</h3>
                  <p className="text-muted-foreground flex-grow mb-4">
                    Contribute to the MultiversX ecosystem by sharing your reusable components with other developers.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/components/submit')}
                  >
                    Submit a Component
                  </Button>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="flex flex-col h-full p-6 bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Discover Solutions</h3>
                  <p className="text-muted-foreground flex-grow mb-4">
                    Find ready-to-use components and tools for common development challenges in the MultiversX ecosystem.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/key-components')}
                  >
                    Explore Library
                  </Button>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="flex flex-col h-full p-6 bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Build Together</h3>
                  <p className="text-muted-foreground flex-grow mb-4">
                    Join a community of developers collaborating to improve and extend the MultiversX component ecosystem.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/key-components')}
                  >
                    Join Community
                  </Button>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={0.4}>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="font-mono"
                  onClick={() => router.push('/key-components')}
                >
                  View Component Library <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/20 to-background">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Image à gauche (4 colonnes) */}
              <AnimatedSection className="md:col-span-5 lg:col-span-4">
                <div className="flex items-center justify-center">
                  <div className="relative w-full overflow-hidden rounded-xl">
                    <Image
                      src="/images/MVXLIB1ST.jpg"
                      alt="MultiversX Hackathon Winner"
                      width={500}
                      height={380}
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        objectFit: 'contain',
                        display: 'block'
                      }}
                      className="rounded-xl"
                    />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-background/90 backdrop-blur-sm px-4 py-1.5 text-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">First Place</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Texte au milieu (renforcé, sur 3 colonnes) */}
              <AnimatedSection delay={0.1} className="md:col-span-3 lg:col-span-4 flex items-center justify-center">
                <div className="flex flex-col space-y-6 bg-card/50 p-6 rounded-xl border border-muted shadow-sm w-full">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-3xl lg:text-4xl text-center md:text-left">
                    MultiversX Hackathon Winner - AI Track
                  </h2>
                  <p className="text-foreground text-lg">
                    We created this project for the MultiversX AI Hackathon and won first place in the AI track. Our solution helps developers understand and work with SDKs and ABIs more efficiently.
                  </p>
                  <p className="text-muted-foreground">
                    The hackathon featured many projects focused on AI and blockchain integration. We're grateful for the recognition from the MultiversX team.
                  </p>
                </div>
              </AnimatedSection>

              {/* Tweet à droite (4 colonnes) */}
              <AnimatedSection delay={0.2} className="md:col-span-4 lg:col-span-4 flex items-center justify-center">
                <div className="overflow-hidden w-full">
                  {/* Intégration Twitter officielle */}
                  <blockquote className="twitter-tweet" data-conversation="none" data-theme="light" data-lang="en" data-cards="hidden"><p lang="en" dir="ltr">AI Track Winners<br /><br />🥇 MvX LIB: Search engine for MultiversX development tools with AI assistance<br /><br />🥈 NPC: On-chain gaming components for autonomous NPCs and account abstraction<br /><br />🥉 xPilot: AI assistant that simplifies MultiversX development <a href="https://t.co/BT99nm7dx3">pic.twitter.com/BT99nm7dx3</a></p>&mdash; CodeMultiversX (@CodeMultiversX) <a href="https://twitter.com/CodeMultiversX/status/1901665746947621231?ref_src=twsrc%5Etfw">March 17, 2025</a></blockquote>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Section Pitch Deck utilisant le composant indépendant */}
        <AnimatedSection>
          <PitchDeck className="bg-gradient-to-b from-background to-muted/30" />
        </AnimatedSection>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <AnimatedSection>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Start Analyzing Today</h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                    Join developers who use MvX SDK Analyzer to streamline their development workflow.
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <div className="relative">
                  <Search 
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
                    onClick={handleBottomSearch}
                  />
                  <Input
                    type="search"
                    placeholder="Search SDKs & ABIs or paste any github url"
                    className="w-full pl-8 font-mono text-sm"
                    value={bottomSearchQuery}
                    onChange={(e) => setBottomSearchQuery(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, bottomSearchQuery)}
                  />
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <div className="flex justify-center mt-6">
                <Button 
                  size="lg" 
                  className="font-mono"
                  onClick={() => navigateToAnalyzer(bottomSearchQuery)}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Section waitlist pour les plans premium */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
          <div className="container-fluid px-4 md:px-8 lg:px-12 xl:px-16 max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <AnimatedSection>
                <div className="space-y-6">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">Coming Soon</div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Premium & Enterprise Access
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Join our waitlist for exclusive access to premium features, extended API limits, and enterprise-grade support.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Extended API Limits</h3>
                        <p className="text-sm text-muted-foreground">
                          Enjoy higher daily, weekly, and monthly request limits for your applications.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Priority Support</h3>
                        <p className="text-sm text-muted-foreground">
                          Get dedicated support and faster response times for your technical inquiries.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Advanced Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                          Access detailed analytics and insights about your API usage and performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2} className="flex justify-center">
                <div className="w-full max-w-md">
                  <WaitlistForm 
                    defaultTier={SubscriptionPlanType.PREMIUM}
                    showTitle={true}
                    className="shadow-md border border-primary/20"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// Style pour masquer la barre de défilement tout en permettant le scroll
export const dynamic = 'force-dynamic';

