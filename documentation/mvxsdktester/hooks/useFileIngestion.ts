import { useState } from 'react';
import { ParsedQuery } from '../types/parser';
import { createSummaryString, createTreeStructure, ingestDirectory, ingestSingleFile } from '../utils/ingestion';
import { FileNode, FileContent } from '../types/fileSystem';

function extractFilesContent(query: ParsedQuery, node: FileNode): FileContent[] {
  const files: FileContent[] = [];
  
  if (node.type === 'file' && node.content !== '[Non-text file]') {
    const content = node.size > query.maxFileSize ? null : node.content || null;
    files.push({
      path: node.path,
      content,
      size: node.size
    });
  } else if (node.type === 'directory' && node.children) {
    for (const child of node.children) {
      files.push(...extractFilesContent(query, child));
    }
  }
  
  return files;
}

function createFileContentString(files: FileContent[]): string {
  let output = '';
  const separator = '='.repeat(48) + '\n';

  for (const file of files) {
    if (!file.content) continue;
    
    output += separator;
    output += `File: ${file.path}\n`;
    output += separator;
    output += `${file.content}\n\n`;
  }

  return output;
}

interface IngestionResult {
  summary: string;
  tree: string;
  content: string;
}

export function useFileIngestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<IngestionResult | null>(null);

  const processRepository = async (query: ParsedQuery) => {
    setLoading(true);
    setError(null);

    try {
      if (query.type === 'blob') {
        // @ts-ignore
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{
            description: 'Text Files',
            accept: {'text/*': ['.txt', '.md', '.js', '.ts', '.json']}
          }]
        });
        const file = await fileHandle.getFile();
        const result = await ingestSingleFile(file, query);
        setResult(result);
      } else {
        const node = await ingestDirectory(query.localPath, query);
        if (!node) {
          throw new Error('No files found or directory is empty');
        }

        setResult({
          summary: createSummaryString(query, node),
          tree: createTreeStructure(query, node),
          content: createFileContentString(extractFilesContent(query, node))
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process repository');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    processRepository
  };
} 