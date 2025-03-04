"use client"

import { useParams, usePathname } from "next/navigation"
import { RepoDataProvider } from "@/components/repo/RepoDataProvider"
import { RepoStats } from "@/components/repo/RepoStats"
import { FileTree } from "@/components/repo/FileTree"
import { FileContent } from "@/components/repo/FileContent"
import { useRepoData } from "@/components/repo/RepoDataProvider"
import { EndpointTesterV2 } from "@/components/repo/EndpointTesterV2"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState, useRef } from "react"
import { SDK } from "@/data/sdkData"
import { useChat } from '@/components/chat/chat-provider'
import { getRepoContext, generateFullContext, getAnalyzerContext, getLandingContext } from "@/data/chat-contexts"
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
        <p className="text-muted-foreground">Select a file to view its content</p>
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

// Composant qui gère la mise à jour du contexte
function ContextManager({ preloadedSDK }: { preloadedSDK: SDK | null }) {
  const { setContext, context } = useChat();
  const { repoMetadata, loading, error, fileTree } = useRepoData();
  const pathname = usePathname();
  const contextRef = useRef(context);
  
  // Fonction utilitaire pour formater la taille
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fonction pour trouver le README dans le fileTree
  const findReadmeContent = (tree: any[]): string | undefined => {
    const readmeFile = tree.find(node => 
      node.type === 'file' && 
      node.name.toLowerCase().startsWith('readme') &&
      node.content
    );
    return readmeFile?.content;
  };

  // Fonction pour convertir fileTree en structure lisible
  const convertFileTreeToStructure = (tree: any[]): string => {
    const formatNode = (node: any, indent: string = ''): string => {
      if (node.type === 'file') {
        return `${indent}${node.name}\n`;
      } else {
        let result = `${indent}${node.name}/\n`;
        if (node.children) {
          node.children.forEach((child: any) => {
            result += formatNode(child, indent + '  ');
          });
        }
        return result;
      }
    };

    return tree.map(node => formatNode(node)).join('');
  };
  
  // Log des changements d'état
  useEffect(() => {
    console.log('ContextManager - État actuel:', {
      loading,
      error,
      hasPreloadedSDK: !!preloadedSDK,
      hasRepoMetadata: !!repoMetadata,
      repoMetadataContent: repoMetadata,
      currentContext: context,
      pathname,
      hasFileTree: !!fileTree?.length
    });
  }, [loading, error, preloadedSDK, repoMetadata, context, pathname, fileTree]);
  
  // Mettre à jour le contexte en fonction de la page et des données
  useEffect(() => {
    // Si nous sommes sur une page d'analyse de SDK spécifique
    if (pathname.match(/^\/analyzer\/[^/]+$/)) {
      // Si les données sont en cours de chargement
      if (loading && contextRef.current !== 'loading') {
        const loadingContext = generateFullContext({
          systemPrompt: "You are a chatbot on the MultiversX SDK analysis site. You are currently viewing a specific SDK. I'm loading the SDK details, please wait a moment for the complete context.",
          userContext: "Loading SDK details..."
        });

        setContext(loadingContext);
        contextRef.current = 'loading';
        return;
      }

      // Si les données sont chargées avec succès
      if (!loading && !error && repoMetadata && fileTree) {
        console.log('ContextManager - Préparation de l\'enrichissement du SDK');

        const enrichedSDK = {
          name: repoMetadata.name || '',
          fullName: repoMetadata.fullName || '',
          description: repoMetadata.description || '',
          size: repoMetadata.totalSize ? formatFileSize(repoMetadata.totalSize) : undefined,
          language: repoMetadata.language,
          last_updated: repoMetadata.lastUpdated,
          totalFiles: repoMetadata.totalFiles,
          structure: convertFileTreeToStructure(fileTree),
          readme: findReadmeContent(fileTree) || 'No README found',
          stars: repoMetadata.stars,
          forks: repoMetadata.forks,
          owner: repoMetadata.owner,
          visibility: repoMetadata.visibility,
          tags: repoMetadata.tags || [],
          github_link: repoMetadata.repoUrl || ''
        };

        const newContext = generateFullContext(getRepoContext(enrichedSDK));
        
        if (newContext !== contextRef.current) {
          setContext(newContext);
          contextRef.current = newContext;
          console.log('ContextManager - Contexte SDK mis à jour avec structure:', enrichedSDK.structure);
        }
      }
    } 
    // Si nous sommes sur la page d'analyse générale
    else if (pathname === '/analyzer') {
      const analyzerContext = generateFullContext(getAnalyzerContext());
      if (analyzerContext !== contextRef.current) {
        setContext(analyzerContext);
        contextRef.current = analyzerContext;
        console.log('ContextManager - Contexte Analyzer mis à jour');
      }
    }
    // Si nous sommes sur la page d'accueil ou une autre page
    else {
      const landingContext = generateFullContext(getLandingContext());
      if (landingContext !== contextRef.current) {
        setContext(landingContext);
        contextRef.current = landingContext;
        console.log('ContextManager - Contexte Landing mis à jour');
      }
    }
  }, [pathname, loading, error, repoMetadata, setContext]);

  return null;
}

export default function AnalyzerPage() {
  const params = useParams();
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"));
  const [preloadedSDK, setPreloadedSDK] = useState<SDK | null>(null);
  
  // Récupérer les données du SDK depuis localStorage au chargement
  useEffect(() => {
    try {
      const sdkData = localStorage.getItem('currentSDK');
      if (sdkData) {
        const sdk = JSON.parse(sdkData);
        setPreloadedSDK(sdk);
        // Les données seront effacées après utilisation
        localStorage.removeItem('currentSDK');
      }
    } catch (error) {
      console.error("Error loading SDK data from localStorage:", error);
    }
  }, []);
  
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
          <ContextManager preloadedSDK={preloadedSDK} />
          <RepoStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-[500px] flex flex-col">
              <FileTree />
            </div>
            <div className="lg:col-span-2 h-[500px] flex flex-col">
              <FileContentWrapper />
            </div>
          </div>
          
          {/* Endpoint Tester */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Endpoint Explorer</h2>
            </div>
            <EndpointTesterV2 />
          </div>

          {/* Chat Assistant */}
          <ChatInterface />
        </RepoDataProvider>
      </div>
    </main>
  );
}

