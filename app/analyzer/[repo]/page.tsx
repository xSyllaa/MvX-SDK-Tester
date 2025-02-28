"use client"

import { useParams } from "next/navigation"
import { RepoDataProvider } from "@/components/repo/RepoDataProvider"
import { RepoStats } from "@/components/repo/RepoStats"
import { FileTree } from "@/components/repo/FileTree"
import { FileContent } from "@/components/repo/FileContent"

export default function AnalyzerPage() {
  const params = useParams()
  const repoPath = decodeURIComponent((params.repo as string).replace(/%2F/g, "/"))
  
  return (
    <main className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">
          SDK Analyzer
        </h1>
        
        <p className="text-muted-foreground">
          Explore and analyze SDKs to better understand their structure and functionalities.
        </p>
        
        <RepoDataProvider repoPath={repoPath}>
          <RepoStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FileTree />
            </div>
            <div className="lg:col-span-2">
              <FileContent />
            </div>
          </div>
        </RepoDataProvider>
      </div>
    </main>
  )
}

