"use client"

import { useState, useEffect } from "react"
import { useRepoData } from "@/components/repo/RepoDataProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Plus, X, Code, HelpCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CodeMirror } from "@/components/code-mirror"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Endpoint = {
  path: string
  method: string
  description?: string
  params?: string[]
  body?: boolean
  source?: string
  lineNumber?: number
}

type RequestParam = {
  name: string
  value: string
}

export function EndpointsTester() {
  const { selectedFile } = useRepoData()
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [requestParams, setRequestParams] = useState<RequestParam[]>([])
  const [requestBody, setRequestBody] = useState("")
  const [requestHeaders, setRequestHeaders] = useState<RequestParam[]>([
    { name: "Content-Type", value: "application/json" }
  ])
  const [responseData, setResponseData] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [responseStatus, setResponseStatus] = useState("")
  const [endpointType, setEndpointType] = useState<"api" | "sdk">("api")

  useEffect(() => {
    // Si le fichier change, analyser le fichier pour trouver les endpoints
    if (selectedFile && selectedFile.type === "file" && selectedFile.content) {
      const fileType = getFileType(selectedFile.path);
      const detectedEndpoints = findEndpointsInFile(selectedFile.content, selectedFile.path)
      
      if (detectedEndpoints.length > 0) {
        const type = detectedEndpoints[0].path.startsWith('/') ? "api" : "sdk";
        setEndpointType(type);
      }
      
      setEndpoints(detectedEndpoints)
      setSelectedEndpoint(null)
      setRequestParams([])
      setRequestBody("")
      setResponseData("")
      setResponseStatus("")
    }
  }, [selectedFile])

  // Détermine le type de fichier en fonction de l'extension
  const getFileType = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    return extension;
  }

  // Fonction pour analyser le fichier et détecter les endpoints
  const findEndpointsInFile = (content: string, path: string): Endpoint[] => {
    const detectedEndpoints: Endpoint[] = []
    
    // Vérifier si c'est un fichier de routes NextJS
    if (path.includes("/app/api/") || path.includes("/pages/api/")) {
      // Chercher les définitions de routes dans les fichiers API NextJS
      // Exemple: export async function GET() { ... }
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
      
      // Si c'est un fichier 'route.js/ts', chercher les méthodes handler
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
    
    // Détection des endpoints dans des modules SDK (comme celui fourni par l'utilisateur)
    if (path.endsWith('.ts') || path.endsWith('.js')) {
      // Recherche de méthodes qui font des appels API via fetchWithTimeout ou fetch
      const apiMethodRegex = /(?:public|private)?\s+(\w+)\s*=\s*async\s*\(\s*([^)]*)\)\s*(?::\s*Promise<[^>]+>)?\s*=>\s*\{[\s\S]*?(?:this\.api\.fetchWithTimeout|fetch)\s*<[^>]*>\s*\(\s*['"`](\/[^'"`]+)['"`]/g;
      
      let match;
      while ((match = apiMethodRegex.exec(content)) !== null) {
        const methodName = match[1];
        const parameters = match[2];
        let endpoint = match[3];
        
        // Déterminer la méthode HTTP en fonction du nom de la méthode
        let httpMethod = "GET";
        if (methodName.toLowerCase().includes('post')) httpMethod = "POST";
        else if (methodName.toLowerCase().includes('put')) httpMethod = "PUT";
        else if (methodName.toLowerCase().includes('delete')) httpMethod = "DELETE";
        else if (methodName.toLowerCase().includes('patch')) httpMethod = "PATCH";
        
        // Extraire les paramètres requis
        const paramList = parameters.split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p);
        
        // Calculer le numéro de ligne approximatif
        const lines = content.slice(0, match.index).split('\n');
        const lineNumber = lines.length;
        
        // Extraire une description à partir des commentaires JSDoc si disponible
        let description = "";
        const jsdocRegex = /\/\*\*[\s\S]*?\*\/\s*(?:public|private)?\s+(\w+)\s*=/g;
        jsdocRegex.lastIndex = 0;
        let jsdocMatch;
        while ((jsdocMatch = jsdocRegex.exec(content)) !== null) {
          if (jsdocMatch[1] === methodName) {
            const jsdoc = jsdocMatch[0];
            const descriptionMatch = jsdoc.match(/@description\s+([^\n]+)/);
            if (descriptionMatch) {
              description = descriptionMatch[1];
            } else {
              // Extraire la première ligne de texte du JSDoc qui n'est pas une annotation
              const lines = jsdoc.split('\n');
              for (const line of lines) {
                const trimmed = line.trim().replace(/^\*\s*/, '');
                if (trimmed && !trimmed.startsWith('@') && !trimmed.startsWith('/*') && !trimmed.startsWith('*/')) {
                  description = trimmed;
                  break;
                }
              }
            }
            break;
          }
        }
        
        // Déterminer si l'endpoint nécessite un corps de requête
        const hasRequestBody = ['POST', 'PUT', 'PATCH'].includes(httpMethod) || 
                              content.slice(match.index, match.index + 1000).includes('body:') ||
                              content.slice(match.index, match.index + 1000).includes('requestBody');
        
        detectedEndpoints.push({
          path: endpoint,
          method: httpMethod,
          description: description || `${methodName}`,
          params: paramList,
          body: hasRequestBody,
          source: methodName,
          lineNumber: lineNumber
        });
      }
      
      // Chercher également les URL d'API littérales dans les backticks avec interpolation
      const templateApiRegex = /['"`](\/[^'"`\s{}]+(?:\$\{[^}]+\}[^'"`\s{}]*)*)['"`]/g;
      while ((match = templateApiRegex.exec(content)) !== null) {
        const endpoint = match[1];
        if (!detectedEndpoints.some(e => e.path === endpoint)) {
          // Éviter les doublons
          detectedEndpoints.push({
            path: endpoint,
            method: "GET",
            description: "API URL detected in code"
          });
        }
      }
    }
    
    return detectedEndpoints;
  }

  const addRequestParam = () => {
    setRequestParams([...requestParams, { name: "", value: "" }])
  }

  const removeRequestParam = (index: number) => {
    const newParams = [...requestParams]
    newParams.splice(index, 1)
    setRequestParams(newParams)
  }

  const updateRequestParam = (index: number, field: 'name' | 'value', newValue: string) => {
    const newParams = [...requestParams]
    newParams[index][field] = newValue
    setRequestParams(newParams)
  }

  const addRequestHeader = () => {
    setRequestHeaders([...requestHeaders, { name: "", value: "" }])
  }

  const removeRequestHeader = (index: number) => {
    const newHeaders = [...requestHeaders]
    newHeaders.splice(index, 1)
    setRequestHeaders(newHeaders)
  }

  const updateRequestHeader = (index: number, field: 'name' | 'value', newValue: string) => {
    const newHeaders = [...requestHeaders]
    newHeaders[index][field] = newValue
    setRequestHeaders(newHeaders)
  }

  const formatJson = (jsonString: string): string => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch (error) {
      return jsonString
    }
  }

  const sendRequest = async () => {
    if (!selectedEndpoint) return
    
    setIsLoading(true)
    setResponseData("")
    setResponseStatus("")
    
    try {
      // Construire l'URL avec les paramètres de requête
      let url = selectedEndpoint.path
      
      // Si c'est un endpoint SDK, ajouter un préfixe d'API
      if (endpointType === "sdk") {
        url = `https://api.xoxno.com${url}`;
      }
      
      // Ajouter les paramètres de requête s'il y en a
      if (requestParams.length > 0) {
        const queryParams = requestParams
          .filter(param => param.name.trim() !== "")
          .map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`)
          .join("&")
        
        if (queryParams) {
          url += (url.includes('?') ? '&' : '?') + queryParams
        }
      }
      
      // Construire les en-têtes
      const headers: Record<string, string> = {}
      requestHeaders.forEach(header => {
        if (header.name.trim() !== "") {
          headers[header.name] = header.value
        }
      })
      
      // Options de la requête
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
        credentials: "include"
      }
      
      // Ajouter le corps pour les méthodes qui le supportent
      if (["POST", "PUT", "PATCH"].includes(selectedEndpoint.method) && requestBody.trim()) {
        options.body = requestBody
      }
      
      // Envoyer la requête
      const response = await fetch(url, options)
      
      // Récupérer les données de la réponse
      let responseText = ""
      
      try {
        const responseJson = await response.json()
        responseText = JSON.stringify(responseJson, null, 2)
      } catch (e) {
        responseText = await response.text()
      }
      
      setResponseData(responseText)
      setResponseStatus(`${response.status} ${response.statusText}`)
    } catch (error) {
      setResponseData(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setResponseStatus("Error")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour générer un exemple de corps de requête basé sur l'endpoint
  const generateRequestBodyExample = () => {
    if (!selectedEndpoint) return '';
    
    if (selectedEndpoint.path.includes('query')) {
      return JSON.stringify({
        filters: {},
        skip: 0,
        top: 10
      }, null, 2);
    }
    
    return JSON.stringify({
      // Exemple basique
      key: "value"
    }, null, 2);
  }

  // Génère des paramètres de requête suggérés basés sur l'endpoint
  const generateSuggestedParams = (endpoint: Endpoint) => {
    const params: RequestParam[] = [];
    
    // Si c'est un SDK endpoint et qu'il a des paramètres déterminés
    if (endpoint.params && endpoint.params.length > 0) {
      for (const param of endpoint.params) {
        if (param !== 'this' && param !== 'args' && !param.includes('{')) {
          params.push({ name: param, value: "" });
        }
      }
    }
    
    // Ajouter des paramètres courants selon l'URL
    if (endpoint.path.includes('?')) {
      // Extraire les paramètres déjà dans l'URL
      const urlParams = new URLSearchParams(endpoint.path.split('?')[1]);
      urlParams.forEach((value, key) => {
        params.push({ name: key, value });
      });
    }
    
    // Ajouter des paramètres suggérés selon le type d'endpoint
    if (endpoint.path.includes('/query') || endpoint.path.includes('/search')) {
      if (!params.some(p => p.name === 'top')) {
        params.push({ name: 'top', value: '10' });
      }
      if (!params.some(p => p.name === 'skip')) {
        params.push({ name: 'skip', value: '0' });
      }
    }
    
    return params;
  }

  // Quand un endpoint est sélectionné, générer des suggestions
  const handleEndpointSelection = (value: string) => {
    const [method, ...pathParts] = value.split("-")
    const path = pathParts.join("-")
    const endpoint = { method, path };
    
    // Trouver l'endpoint complet avec ses metadonnées
    const fullEndpoint = endpoints.find(e => e.method === method && e.path === path) || endpoint;
    
    setSelectedEndpoint(fullEndpoint);
    
    // Générer des paramètres suggérés
    const suggestedParams = generateSuggestedParams(fullEndpoint);
    if (suggestedParams.length > 0) {
      setRequestParams(suggestedParams);
    } else {
      setRequestParams([]);
    }
    
    // Générer un exemple de corps de requête si nécessaire
    if (fullEndpoint.body) {
      setRequestBody(generateRequestBodyExample());
    } else {
      setRequestBody("");
    }
  }

  return (
    <div className="rounded-lg border bg-background shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Endpoints Tester</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Test API endpoints found in the selected file
        </p>
      </div>
      
      {endpoints.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            {selectedFile ? 
              "No API endpoints found in this file. Select a file that contains API routes or SDK methods." : 
              "Select a file to detect API endpoints"
            }
          </p>
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium block">
                Select an endpoint:
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
                      <p><strong>Endpoint Type: {endpointType === 'api' ? 'API Route' : 'SDK Method'}</strong></p>
                      <p>
                        {endpointType === 'api' 
                          ? "This file contains Next.js API routes that can be directly called." 
                          : "This file contains SDK methods that make API calls. Tests will be directed to the actual API endpoints."}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={selectedEndpoint ? `${selectedEndpoint.method}-${selectedEndpoint.path}` : ""}
              onValueChange={handleEndpointSelection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an endpoint" />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((endpoint, index) => (
                  <SelectItem 
                    key={index} 
                    value={`${endpoint.method}-${endpoint.path}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-block px-2 py-0.5 text-xs font-medium rounded
                        ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : ''}
                        ${endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' : ''}
                        ${endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
                        ${endpoint.method === 'PATCH' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {endpoint.method}
                      </span>
                      <span className="truncate max-w-[300px]">{endpoint.path}</span>
                    </div>
                    {endpoint.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 ml-8">
                        {endpoint.source ? `${endpoint.source}: ` : ""}{endpoint.description}
                      </div>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedEndpoint && (
            <>
              <Tabs defaultValue="params">
                <TabsList className="mb-4">
                  <TabsTrigger value="params">Query Parameters</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>
                
                <TabsContent value="params" className="space-y-4">
                  {requestParams.map((param, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Parameter name"
                        value={param.name}
                        onChange={(e) => updateRequestParam(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => updateRequestParam(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeRequestParam(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addRequestParam}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                </TabsContent>
                
                <TabsContent value="headers" className="space-y-4">
                  {requestHeaders.map((header, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Header name"
                        value={header.name}
                        onChange={(e) => updateRequestHeader(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateRequestHeader(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeRequestHeader(index)}
                        disabled={index === 0 && header.name === "Content-Type"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addRequestHeader}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>
                </TabsContent>
                
                <TabsContent value="body">
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setRequestBody(formatJson(requestBody))}
                        className="text-xs"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Format JSON
                      </Button>
                    </div>
                    <Textarea
                      placeholder={`{\n  "key": "value"\n}`}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="font-mono h-40"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <Button 
                  onClick={sendRequest}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
              
              {responseStatus && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Response</h3>
                    <div className={`
                      px-2 py-0.5 text-xs font-medium rounded
                      ${responseStatus.startsWith('2') ? 'bg-green-100 text-green-800' : ''}
                      ${responseStatus.startsWith('4') ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${responseStatus.startsWith('5') || responseStatus === 'Error' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {responseStatus}
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden bg-muted/20">
                    <div className="h-60 overflow-auto">
                      <CodeMirror
                        value={responseData}
                        height="100%"
                        filename={responseData.startsWith('{') ? "response.json" : "response.txt"}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
} 