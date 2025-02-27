import { useState } from 'react';
import { Octokit } from 'octokit';

interface UseGithubCloneProps {
  token?: string;
}

interface TreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

interface BlobResponse {
  content: string;
  encoding: string;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  content?: string;
  children?: FileNode[];
  sha: string;
}

interface CloneResult {
  success: boolean;
  data: FileNode[];
  error?: {
    message: string;
    status?: number;
    details?: string;
  };
}

export function useGithubClone({ token = process.env.NEXT_PUBLIC_GITHUB_TOKEN }: UseGithubCloneProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const octokit = new Octokit({
    auth: token || ""
  });

  const cloneRepository = async (repoUrl: string): Promise<CloneResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const matches = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!matches) {
        throw new Error('URL GitHub invalide');
      }
      const [, owner, repo] = matches;
      
      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      const defaultBranch = repoData.default_branch;

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "1",
      });

      if (treeData.truncated) {
        console.warn("L'arbre Git est tronqué car trop volumineux");
      }

      const fileNodes: FileNode[] = [];
      
      for (const item of treeData.tree) {
        if (!item.path || !item.sha) {
          console.warn("Item incomplet dans l'arbre Git:", item);
          continue;
        }

        const isFile = item.type === "blob";
        const pathParts = item.path.split("/");
        const name = pathParts.pop() || "";
        
        const node: FileNode = {
          name,
          path: item.path,
          type: isFile ? "file" : "directory",
          sha: item.sha,
          size: item.size,
          children: isFile ? undefined : [],
        };
        
        fileNodes.push(node);
      }
      
      const MAX_FILE_SIZE = 500 * 1024;
      const filePromises = fileNodes
        .filter(file => file.type === "file" && (file.size || 0) < MAX_FILE_SIZE)
        .map(async (file) => {
          try {
            const { data } = await octokit.rest.git.getBlob({
              owner,
              repo,
              file_sha: file.sha,
            });
            
            if (data.encoding === "base64") {
              file.content = data.content;
            }
          } catch (err) {
            console.warn(`Erreur lors du chargement du fichier ${file.path}:`, err);
          }
        });

      await Promise.all(filePromises);

      return {
        success: true,
        data: fileNodes
      };
    } catch (err: any) {
      console.error('Erreur de clonage:', err);
      const errorMessage = {
        message: 'Erreur lors du clonage du dépôt',
        status: err.status || err.response?.status,
        details: err.message || err.response?.data?.message
      };
      setError(`${errorMessage.message} (${errorMessage.status}): ${errorMessage.details}`);
      return {
        success: false,
        data: [],
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cloneRepository,
    isLoading,
    error,
  };
} 