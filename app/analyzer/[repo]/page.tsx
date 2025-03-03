"use client"

import { useParams } from "next/navigation"
import { RepoDataProvider } from "@/components/repo/RepoDataProvider"
import { RepoStats } from "@/components/repo/RepoStats"
import { FileTree } from "@/components/repo/FileTree"
import { FileContent } from "@/components/repo/FileContent"
import { useRepoData } from "@/components/repo/RepoDataProvider"
import { EndpointsTester } from "@/components/repo/EndpointsTester"
import { EndpointTesterV2 } from "@/components/repo/EndpointTesterV2"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { SDK } from "@/data/sdkData"
import { generateSDKContext } from "@/lib/chat-context"
import { useChat } from '@/components/chat/chat-provider'
import { tagCategoryColors, TagCategory, tagCategoryDescriptions } from "@/data/sdkData"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// Composant qui utilise le contexte pour rendre le contenu du fichier
function FileContentWrapper() {
  const { selectedFile } = useRepoData();
  
  if (!selectedFile || selectedFile.type !== 'file') {
    return (
      <div className="border rounded-md overflow-hidden bg-background p-4 flex items-center justify-center h-[500px]">
        <p className="text-muted-foreground">Sélectionnez un fichier pour afficher son contenu</p>
      </div>
    );
  }
  
  // Calculer le nombre de lignes
  const lines = selectedFile.content ? selectedFile.content.split('\n').length : 0;
  
  return (
    <FileContent 
      content={selectedFile.content || ""} 
      path={selectedFile.path} 
      size={selectedFile.size || 0}
      lines={lines}
    />
  );
}

export default function AnalyzerPage() {
  const { setContext } = useChat();
  const params = useParams()
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"))
  const [preloadedSDK, setPreloadedSDK] = useState<SDK | null>(null)
  
  // Récupérer les données du SDK depuis localStorage au chargement
  useEffect(() => {
    try {
      const sdkData = localStorage.getItem('currentSDK')
      if (sdkData) {
        const sdk = JSON.parse(sdkData)
        setPreloadedSDK(sdk)
        // Générer le contexte du SDK
        const context = generateSDKContext(sdk)
        setContext(context)
        // Effacer les données après utilisation
        localStorage.removeItem('currentSDK')
      } else {
        // Si pas de SDK, utiliser le chemin du dépôt comme contexte
        setContext(`Current repository: ${repoPath}`)
      }
    } catch (error) {
      console.error("Error loading SDK data from localStorage:", error)
      setContext(`Current repository: ${repoPath}`)
    }
  }, [repoPath, setContext])
  
  return (
    <main className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">
          SDK Analyzer
        </h1>
        
        <p className="text-muted-foreground">
          Explore and analyze SDKs to better understand their structure and functionalities.
        </p>
        
        <RepoDataProvider repoPath={repoPath} preloadedSDK={preloadedSDK}>
          <RepoStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-[500px] flex flex-col">
              <FileTree />
            </div>
            <div className="lg:col-span-2 h-[500px] flex flex-col">
              <FileContentWrapper />
            </div>
          </div>
          
          {/* Testeur d'endpoints avec choix de version */}
          <div className="mt-6">
            <Tabs defaultValue="v2" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Testeur d'Endpoints</h2>
                <TabsList>
                  <TabsTrigger value="v1">Version Standard</TabsTrigger>
                  <TabsTrigger value="v2">Explorateur</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="v1">
                <EndpointsTester />
              </TabsContent>
              
              <TabsContent value="v2">
                <EndpointTesterV2 />
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Assistant */}
          <ChatInterface />
        </RepoDataProvider>
      </div>
    </main>
  )
}

