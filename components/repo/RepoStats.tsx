"use client"

import { Loader2 } from "lucide-react"
import { useRepoData } from "@/components/repo/RepoDataProvider"
import { tagCategoryColors, TagCategory } from '@/data/sdkData'

// Fonction pour obtenir la description de la catégorie
function getCategoryDescription(category: TagCategory): string {
  switch (category) {
    case TagCategory.LANGUAGE:
      return "Programming language used";
    case TagCategory.PURPOSE:
      return "Main objective or use case";
    case TagCategory.FRAMEWORK:
      return "Framework or library used";
    case TagCategory.PLATFORM:
      return "Compatible platform or environment";
    case TagCategory.TECHNOLOGY:
      return "Integrated technology or tool";
    case TagCategory.OTHER:
      return "Other relevant information";
    default:
      return "Tag category";
  }
}

export function RepoStats() {
  const { repoMetadata, loading, formatFileSize } = useRepoData();

  return (
    <div className="rounded-lg border bg-background shadow-sm w-full mb-4">
      <div className="p-4 border-b">
        {!repoMetadata ? (
          // Skeleton loader pour l'en-tête pendant le chargement
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-full bg-muted rounded animate-pulse mt-2"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">
                    {repoMetadata.fullName.split('/')[0]}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span>{repoMetadata.name}</span>
                  <a 
                    href={repoMetadata.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-muted-foreground hover:text-primary"
                    title="View on GitHub"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </h1>
              </div>

              {/* Statistiques GitHub avec infobulles */}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-1 shadow-sm bg-muted/30">
                <div 
                  className="flex items-center gap-1 pr-3 border-r cursor-help tooltip" 
                  data-tooltip="GitHub Stars - Number of users who have starred this repository"
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="font-semibold">{repoMetadata.stars.toLocaleString()}</span>
                </div>
                <div 
                  className="flex items-center gap-1 pl-1 cursor-help tooltip" 
                  data-tooltip="GitHub Forks - Number of copies created from this repository for independent development"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.146.735-.565 1.791-1.778 2.252-1.192.452-2.053.953-2.646 1.536-.593-.583-1.453-1.084-2.646-1.536-1.213-.461-1.633-1.517-1.778-2.252C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-11 0C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4zm5 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5z"></path>
                  </svg>
                  <span className="font-semibold">{repoMetadata.forks.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground mt-1">{repoMetadata.description}</p>
            
            {/* Tags - Avec infobulles */}
            {repoMetadata.tags && repoMetadata.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {repoMetadata.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help tooltip" 
                    style={{ 
                      backgroundColor: `${tagCategoryColors[tag.category]}20`, 
                      color: tagCategoryColors[tag.category],
                      border: `1px solid ${tagCategoryColors[tag.category]}`
                    }}
                    data-tooltip={`${tag.category} - ${getCategoryDescription(tag.category)}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Grille de statistiques avec état de chargement */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y">
        {!repoMetadata ? (
          // Skeleton loader pour les statistiques
          <>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Files</div>
              <div className="h-6 w-16 bg-muted rounded animate-pulse mt-1"></div>
            </div>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Size</div>
              <div className="h-6 w-24 bg-muted rounded animate-pulse mt-1"></div>
            </div>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Language</div>
              <div className="h-6 w-20 bg-muted rounded animate-pulse mt-1"></div>
            </div>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Last Updated</div>
              <div className="h-6 w-28 bg-muted rounded animate-pulse mt-1"></div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Files</div>
              <div className="text-2xl font-bold">{repoMetadata.totalFiles.toLocaleString()}</div>
            </div>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Size</div>
              <div className="text-2xl font-bold">{formatFileSize(repoMetadata.totalSize)}</div>
            </div>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Language</div>
              <div className="text-2xl font-bold">{repoMetadata.language || '—'}</div>
            </div>
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Last Updated</div>
              <div className="text-2xl font-bold">
                {repoMetadata.lastUpdated ? new Date(repoMetadata.lastUpdated).toLocaleDateString() : '—'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 