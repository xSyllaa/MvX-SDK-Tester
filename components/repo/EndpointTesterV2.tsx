"use client"

import { useState, useEffect, useCallback } from "react"
import { useRepoData } from "@/components/repo/RepoDataProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, HelpCircle, FileJson, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatFileSize } from "@/lib/utils"
import { parameterTypes, detectParameterType, generateExampleValue, ParameterType } from "@/lib/endpoint-utils"

type Endpoint = {
  path: string
  method: string
  description?: string
  params?: string[]
  body?: boolean
  source?: string
  lineNumber?: number
  pathVariables?: string[]
  jsdocDescription?: string
  jsdocParams?: Record<string, string>
  jsdocReturn?: string
}

type RequestParam = {
  name: string
  value: string
  required?: boolean
  isPathVariable?: boolean
  type?: ParameterType
  description?: string
}

// Custom hook to detect endpoints
function useEndpointDetection(fileContent: string, filePath: string) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [fileLanguage, setFileLanguage] = useState<string>("unknown")
  
  // Detect file language
  useEffect(() => {
    if (filePath) {
      const language = getLanguageModeForFile(filePath)
      setFileLanguage(language)
    }
  }, [filePath])
  
  // Detect endpoints
  useEffect(() => {
    if (fileContent && filePath) {
      const detectedEndpoints = findEndpointsInFile(fileContent, filePath, fileLanguage)
      setEndpoints(detectedEndpoints)
    }
  }, [fileContent, filePath, fileLanguage])
  
  return {
    endpoints,
    fileLanguage
  }
}

// Custom hook for endpoint selection
function useEndpointSelection(endpoints: Endpoint[]) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [requestParams, setRequestParams] = useState<RequestParam[]>([])
  
  // Function to update a parameter
  const updateRequestParam = useCallback((index: number, field: 'name' | 'value', newValue: string) => {
    setRequestParams(prevParams => {
      const newParams = [...prevParams]
      newParams[index][field] = newValue
      return newParams
    })
  }, [])
  
  // Endpoint selection
  const handleEndpointSelection = useCallback((value: string) => {
    const [method, ...pathParts] = value.split("-")
    const path = pathParts.join("-")
    const endpointBasic = { method, path } as Endpoint
    
    // Find the complete endpoint with its metadata
    const fullEndpoint = endpoints.find(e => e.method === method && e.path === path) || endpointBasic
    
    setSelectedEndpoint(fullEndpoint)
    
    // Generate suggested parameters including path variables
    const suggestedParams = generateSuggestedParams(fullEndpoint)
    setRequestParams(suggestedParams)
  }, [endpoints])
  
  return {
    selectedEndpoint,
    requestParams,
    updateRequestParam,
    handleEndpointSelection
  }
}

// Function to determine endpoints based on language and file content
const findEndpointsInFile = (content: string, path: string, language: string): Endpoint[] => {
  const detectedEndpoints: Endpoint[] = []
  
  // Check if it's a NextJS routes file
  if (path.includes("/app/api/") || path.includes("/pages/api/")) {
    // Look for route definitions in NextJS API files
    const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    
    for (const method of httpMethods) {
      const regex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(`, "g")
      if (regex.test(content)) {
        const routePath = path.replace(/\.(js|ts)x?$/, "")
          .replace(/\/route$/, "")
          .replace(/^.*\/app\/api/, "/api")
          .replace(/^.*\/pages\/api/, "/api")
          .replace(/\/\[([^\]]+)\]/g, "/:$1")
        
        detectedEndpoints.push({
          path: routePath,
          method: method
        })
      }
    }
    
    // If it's a 'route.js/ts' file, look for handler methods
    if (path.includes("/route.")) {
      const routePath = path.replace(/\.(js|ts)x?$/, "")
        .replace(/\/route$/, "")
        .replace(/^.*\/app\/api/, "/api")
        .replace(/\/\[([^\]]+)\]/g, "/:$1")
      
      for (const method of httpMethods) {
        const regex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(`, "g")
        if (regex.test(content)) {
          detectedEndpoints.push({
            path: routePath,
            method: method
          })
        }
      }
    }
  }
  
  // Specific detection for TypeScript/JavaScript (SDK or other APIs)
  if (language === "typescript" || language === "javascript") {
    // Function to extract JSDoc comments for a method
    const extractJSDocComment = (methodIndex: number): { description: string, params: Record<string, string>, returns: string } => {
      // Look for JSDoc comment preceding the method
      const beforeMethod = content.substring(0, methodIndex);
      const commentEndIndex = beforeMethod.lastIndexOf('*/');
      
      if (commentEndIndex === -1) {
        return { description: '', params: {}, returns: '' };
      }
      
      const commentStartIndex = beforeMethod.lastIndexOf('/**', commentEndIndex);
      
      if (commentStartIndex === -1) {
        return { description: '', params: {}, returns: '' };
      }
      
      const jsdocComment = beforeMethod.substring(commentStartIndex, commentEndIndex + 2);
      
      // Extract main description
      const mainDescriptionMatch = jsdocComment.match(/\/\*\*\s*([\s\S]*?)(?:\s*@|\s*\*\/)/);
      const mainDescription = mainDescriptionMatch 
        ? mainDescriptionMatch[1].replace(/^\s*\*\s*/gm, '').trim() 
        : '';
      
      // Extract parameters
      const paramRegex = /@param\s+\{[^}]*\}\s+(\w+)\s+-\s+([\s\S]*?)(?=\s*@|\s*\*\/)/g;
      const params: Record<string, string> = {};
      let paramMatch;
      
      while ((paramMatch = paramRegex.exec(jsdocComment)) !== null) {
        const paramName = paramMatch[1];
        const paramDescription = paramMatch[2].replace(/^\s*\*\s*/gm, '').trim();
        params[paramName] = paramDescription;
      }
      
      // Extract return value
      const returnsMatch = jsdocComment.match(/@returns\s+\{[^}]*\}\s+([\s\S]*?)(?=\s*@|\s*\*\/)/);
      const returns = returnsMatch 
        ? returnsMatch[1].replace(/^\s*\*\s*/gm, '').trim() 
        : '';
      
      return { description: mainDescription, params, returns };
    };

    // Search for methods that make API calls
    const apiMethodRegex = /(?:public|private)?\s+(\w+)\s*=\s*async\s*\(\s*([^)]*)\)\s*(?::\s*Promise<[^>]+>)?\s*=>\s*\{[\s\S]*?(?:this\.api\.fetchWithTimeout|fetch)\s*<[^>]*>\s*\(\s*['"`](\/[^'"`]+)['"`]/g;
    
    let match;
    while ((match = apiMethodRegex.exec(content)) !== null) {
      const methodName = match[1];
      const parameters = match[2];
      let endpoint = match[3];
      
      // Extract JSDoc comments
      const jsdoc = extractJSDocComment(match.index);
      
      // Determine HTTP method based on method name
      let httpMethod = "GET";
      if (methodName.toLowerCase().includes('post')) httpMethod = "POST";
      else if (methodName.toLowerCase().includes('put')) httpMethod = "PUT";
      else if (methodName.toLowerCase().includes('delete')) httpMethod = "DELETE";
      else if (methodName.toLowerCase().includes('patch')) httpMethod = "PATCH";
      
      // Add detected endpoint
      detectedEndpoints.push({
        path: endpoint,
        method: httpMethod,
        description: `SDK Method: ${methodName}(${parameters})`,
        source: path,
        lineNumber: getLineNumber(content, match.index),
        jsdocDescription: jsdoc.description,
        jsdocParams: jsdoc.params,
        jsdocReturn: jsdoc.returns
      });
    }
    
    // Detection for SDK modules (like XOXNO)
    if (content.includes('XOXNOClient') || path.includes('xoxno') || path.includes('XOXNO')) {
      // Search for specific API methods
      const xoxnoMethodRegex = /(?:public|private)?\s+(\w+)\s*=?\s*(?:async)?\s*\(([^)]*)\)/g;
      
      while ((match = xoxnoMethodRegex.exec(content)) !== null) {
        const methodName = match[1];
        const parameters = match[2];
        
        // Ignore constructors and private/internal methods
        if (methodName === 'constructor' || methodName.startsWith('_')) continue;
        
        // Extract JSDoc comments
        const jsdoc = extractJSDocComment(match.index);
        
        // Determine endpoint path based on module and method
        let endpoint = '';
        if (path.includes('NFTModule') || path.toLowerCase().includes('nft')) {
          if (methodName === 'getDailyTrending') {
            endpoint = '/nfts/getDailyTrending';
          } else if (methodName === 'search') {
            endpoint = '/nft/search/query';
          }
        } else if (path.includes('CollectionModule') || path.toLowerCase().includes('collection')) {
          if (methodName === 'getCollectionProfile') {
            endpoint = '/collection/${collectionId}/profile';
          } else if (methodName === 'getFloorPrice') {
            endpoint = '/collection/${collectionId}/floor-price';
          }
        }
        
        // If an endpoint was determined, add it to the list
        if (endpoint) {
          // Extract path variables from the endpoint
          const pathVariables = [];
          const pathVarRegex = /\$\{([^}]+)\}/g;
          let pathVarMatch;
          while ((pathVarMatch = pathVarRegex.exec(endpoint)) !== null) {
            pathVariables.push(pathVarMatch[1]);
          }
          
          detectedEndpoints.push({
            path: endpoint,
            method: 'GET',
            description: `SDK Method: ${methodName}(${parameters})`,
            source: path,
            lineNumber: getLineNumber(content, match.index),
            pathVariables: pathVariables.length > 0 ? pathVariables : undefined,
            jsdocDescription: jsdoc.description,
            jsdocParams: jsdoc.params,
            jsdocReturn: jsdoc.returns
          });
        }
      }
    }
  }
  
  return detectedEndpoints
}

// Utility function to get line number from text index
const getLineNumber = (text: string, index: number): number => {
  return text.substring(0, index).split('\n').length;
};

// Function to generate suggested parameters from an endpoint
const generateSuggestedParams = (endpoint: Endpoint): RequestParam[] => {
  const params: RequestParam[] = [];
  
  // First add path variables as parameters
  if (endpoint.pathVariables && endpoint.pathVariables.length > 0) {
    for (const varName of endpoint.pathVariables) {
      // Detect parameter type
      const paramType = detectParameterType(varName);
      
      // Use JSDoc description if available
      const jsdocParamDescription = endpoint.jsdocParams?.[varName];
      
      params.push({ 
        name: varName, 
        value: generateExampleValue(paramType, varName), 
        required: true,
        isPathVariable: true,
        type: paramType,
        description: jsdocParamDescription || `Path variable for ${varName}`
      });
    }
  }
  
  // If it's a SDK endpoint and has determined parameters
  if (endpoint.params && endpoint.params.length > 0) {
    for (const param of endpoint.params) {
      if (param !== 'this' && param !== 'args' && !param.includes('{')) {
        // Check if this parameter isn't already in the list (to avoid duplicates)
        if (!params.some(p => p.name === param)) {
          const paramType = detectParameterType(param);
          
          params.push({ 
            name: param, 
            value: generateExampleValue(paramType, param), 
            required: true,
            type: paramType
          });
        }
      }
    }
  }
  
  // Add common parameters based on URL
  if (endpoint.path.includes('?')) {
    // Extract parameters already in URL
    const urlParams = new URLSearchParams(endpoint.path.split('?')[1]);
    urlParams.forEach((value, key) => {
      // Avoid duplicates with path variables
      if (!params.some(p => p.name === key)) {
        const paramType = detectParameterType(key);
        
        params.push({ 
          name: key, 
          value: value || generateExampleValue(paramType, key), 
          required: true,
          type: paramType
        });
      }
    });
  }
  
  // Add suggested parameters based on endpoint type
  if (endpoint.path.includes('/query') || endpoint.path.includes('/search')) {
    if (!params.some(p => p.name === 'top')) {
      params.push({ 
        name: 'top', 
        value: '10', 
        required: true,
        type: 'number',
        description: 'Maximum number of items to return'
      });
    }
    if (!params.some(p => p.name === 'skip')) {
      params.push({ 
        name: 'skip', 
        value: '0', 
        required: true,
        type: 'number',
        description: 'Number of items to skip (pagination)'
      });
    }
  }
  
  // Analyze method name to identify additional relevant parameters
  if (endpoint.description) {
    const methodName = endpoint.description.match(/SDK Method: (\w+)/)?.[1]?.toLowerCase();
    
    if (methodName) {
      // Collection-related methods
      if (methodName.includes('collection') && !params.some(p => p.name === 'collection')) {
        params.push({
          name: 'collection',
          value: '',
          required: true,
          type: 'string',
          description: 'Collection identifier'
        });
      }
      
      // User-related methods
      if (methodName.includes('user') && !params.some(p => p.name === 'userId')) {
        params.push({
          name: 'userId',
          value: '',
          required: true,
          type: 'id',
          description: 'User identifier'
        });
      }
      
      // NFT-related methods
      if (methodName.includes('nft') && !params.some(p => p.name === 'identifier')) {
        params.push({
          name: 'identifier',
          value: '',
          required: true,
          type: 'id',
          description: 'NFT identifier'
        });
      }
    }
  }
  
  return params;
}

// Sous-composant pour afficher les endpoints
function EndpointSelector({ endpoints, selectedValue, onValueChange, onLineSelect }: {
  endpoints: Endpoint[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  onLineSelect?: (lineNumber: number, filePath: string) => void;
}) {
  // Fonction pour gérer la sélection d'un endpoint et son numéro de ligne
  const handleEndpointSelect = useCallback((endpoint: Endpoint, e: React.MouseEvent) => {
    // Empêcher la propagation et le comportement par défaut
    e.preventDefault();
    e.stopPropagation();
    
    // Appeler onValueChange avec l'endpoint sélectionné
    onValueChange(`${endpoint.method}-${endpoint.path}`);
    
    // Si l'endpoint a un numéro de ligne et un chemin source, envoyer directement à CodeMirror
    if (typeof endpoint.lineNumber === 'number' && endpoint.source && onLineSelect) {
      onLineSelect(endpoint.lineNumber, endpoint.source);
    }
  }, [onValueChange, onLineSelect]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium block">
          Select an endpoint
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <HelpCircle size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="end" className="max-w-sm">
              <div className="space-y-1 text-xs">
                <p><strong>Endpoint type: {endpoints.length > 0 && endpoints[0].path.startsWith('/') ? 'API Route' : 'SDK Method'}</strong></p>
                <p>
                  {endpoints.length > 0 && endpoints[0].path.startsWith('/') 
                    ? "This file contains Next.js API routes that can be called directly." 
                    : "This file contains SDK methods that make API calls."}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Interface de sélection en deux colonnes avec scrollbar */}
      <div className="border rounded-md overflow-hidden">
        <div className="max-h-96 overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-3">
            {endpoints.map((endpoint, index) => (
              <div 
                key={index}
                onClick={(e) => handleEndpointSelect(endpoint, e)}
                className={`
                  p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors
                  ${selectedValue === `${endpoint.method}-${endpoint.path}` ? 'bg-muted' : 'border border-muted/50'}
                `}
              >
                <div className="flex items-start gap-2">
                  <span className={`
                    inline-block px-2 py-0.5 text-xs font-medium rounded shrink-0
                    ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : ''}
                    ${endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' : ''}
                    ${endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
                    ${endpoint.method === 'PATCH' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {endpoint.method}
                  </span>
                  <span className="break-all text-sm leading-tight">{endpoint.path}</span>
                </div>
                {endpoint.description && (
                  <div className="text-xs text-muted-foreground mt-1.5 ml-0 leading-tight">
                    {endpoint.source ? (
                      <span className="font-medium">{endpoint.source}: </span>
                    ) : ""}
                    {endpoint.description}
                  </div>
                )}
                {/* Afficher la description JSDoc si disponible */}
                {endpoint.jsdocDescription && (
                  <div className="text-xs mt-1.5 mb-1 ml-0 leading-tight text-muted-foreground">
                    {endpoint.jsdocDescription}
                  </div>
                )}
                {endpoint.lineNumber && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Ligne: {endpoint.lineNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Affichage de l'endpoint sélectionné */}
      {selectedValue && endpoints.find(e => `${e.method}-${e.path}` === selectedValue) && (
        <div className="mt-4 bg-muted/20 p-3 rounded-md border">
          <div className="text-sm mb-2">
            <span className="text-muted-foreground">Selected: </span>
            <span className="font-medium">
              {endpoints.find(e => `${e.method}-${e.path}` === selectedValue)?.path}
            </span>
          </div>
          
          {/* Afficher la description complète JSDoc pour l'endpoint sélectionné */}
          {(() => {
            const selectedEndpoint = endpoints.find(e => `${e.method}-${e.path}` === selectedValue);
            if (!selectedEndpoint?.jsdocDescription) return null;
            
            return (
              <div className="text-sm">
                <p className="mb-2">{selectedEndpoint.jsdocDescription}</p>
                
                {selectedEndpoint.jsdocReturn && (
                  <div className="mt-2">
                    <span className="font-medium">Retourne: </span>
                    <span>{selectedEndpoint.jsdocReturn}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Sous-composant pour afficher les paramètres
function ParametersEditor({ params, updateParam }: {
  params: RequestParam[];
  updateParam: (index: number, field: 'name' | 'value', value: string) => void;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Parameters</h3>
      {params.length === 0 ? (
        <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
          No parameters detected for this endpoint
        </div>
      ) : (
        <div className="space-y-4">
          {params.map((param, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-medium">{param.name}</label>
                    {param.type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${parameterTypes[param.type].color}`}>
                        {parameterTypes[param.type].label}
                      </span>
                    )}
                    {param.isPathVariable && (
                      <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
                        path
                      </span>
                    )}
                  </div>
                  <Input
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => updateParam(index, 'value', e.target.value)}
                    className={`w-full ${param.isPathVariable ? 'border-cyan-300' : ''}`}
                  />
                </div>
              </div>
              {param.description && (
                <div className="text-xs text-muted-foreground flex items-start gap-1.5 ml-1">
                  <Info className="h-3 w-3 mt-0.5" />
                  <span>{param.description}</span>
                </div>
              )}
              {param.type && !param.description && (
                <div className="text-xs text-muted-foreground flex items-start gap-1.5 ml-1">
                  <Info className="h-3 w-3 mt-0.5" />
                  <span>{parameterTypes[param.type].description}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant pour afficher des informations sur le fichier
function LanguageInfo({ language, filePath }: { language: string; filePath: string }) {
  return (
    <Alert className="mb-4">
      <div className="flex items-center gap-2">
        <FileJson className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">File type:</span> {language} 
          {filePath && <span className="text-muted-foreground ml-2">({filePath})</span>}
        </AlertDescription>
      </div>
    </Alert>
  );
}

// Composant principal
export function EndpointTesterV2() {
  const { selectedFile, setScrollToLine } = useRepoData()
  
  // État pour stocker le contenu du fichier sélectionné et son chemin
  const [fileContent, setFileContent] = useState<string>("")
  const [filePath, setFilePath] = useState<string>("")
  
  // Mise à jour du contenu et du chemin lorsque le fichier sélectionné change
  useEffect(() => {
    if (selectedFile && selectedFile.content) {
      setFileContent(selectedFile.content)
      setFilePath(selectedFile.path || "")
    }
  }, [selectedFile])
  
  // Utiliser les hooks personnalisés
  const { endpoints, fileLanguage } = useEndpointDetection(fileContent, filePath)
  const { selectedEndpoint, requestParams, updateRequestParam, handleEndpointSelection } = useEndpointSelection(endpoints)
  
  // Fonction pour naviguer vers la ligne de code de l'endpoint
  const handleLineSelect = useCallback((lineNumber: number | undefined, filePath: string) => {
    if (typeof lineNumber !== 'number' || !filePath) return;
    
    // Normaliser le chemin du fichier
    const normalizedPath = filePath.replace(/^src\//, '');
    
    // Envoyer le message avec les informations de défilement et une option pour empêcher le scroll de la page
    window.postMessage({
      type: 'SCROLL_TO_LINE',
      lineNumber: lineNumber - 1,
      filePath: normalizedPath,
      preventPageScroll: true
    }, window.location.origin);
  }, []);
  
  return (
    <div className="rounded-lg border bg-background shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Endpoint Explorer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {endpoints.length} endpoints found in file {filePath ? filePath.split('/').pop() : "selected"}
        </p>
      </div>
      
      {endpoints.length === 0 ? (
        <div className="p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Code className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {selectedFile ? 
                "No endpoints found in this file. Select a file containing API routes or SDK methods." : 
                "Select a file to detect endpoints"
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* Information sur le langage détecté */}
          <LanguageInfo language={fileLanguage} filePath={filePath} />
          
          {/* Endpoint Selector */}
          <EndpointSelector
            endpoints={endpoints}
            selectedValue={selectedEndpoint ? `${selectedEndpoint.method}-${selectedEndpoint.path}` : ""}
            onValueChange={handleEndpointSelection}
            onLineSelect={handleLineSelect}
          />
          
          {/* Selected Endpoint UI */}
          {selectedEndpoint && (
            <>
              {/* URL Preview */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Endpoint URL</h3>
                <div className="p-3 bg-muted/20 border rounded-md overflow-x-auto">
                  <code className="text-xs font-mono whitespace-nowrap">
                    <span className="text-blue-600 font-semibold">{selectedEndpoint.method}</span> {selectedEndpoint.path}
                  </code>
                </div>
              </div>
              
              {/* Parameters Editor */}
              <ParametersEditor 
                params={requestParams}
                updateParam={updateRequestParam}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Fonction pour déterminer le langage à partir de l'extension de fichier
function getLanguageModeForFile(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const modeMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'htmlmixed',
    'css': 'css',
    'json': 'application/json',
    'md': 'markdown',
    'php': 'php',
    'py': 'python',
    'go': 'go',
    'java': 'clike',
    'c': 'clike',
    'cpp': 'clike',
    'cs': 'clike',
    'rs': 'rust',
    'rb': 'ruby',
    'sh': 'shell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
  };
  
  return modeMap[extension || ''] || 'text/plain';
} 