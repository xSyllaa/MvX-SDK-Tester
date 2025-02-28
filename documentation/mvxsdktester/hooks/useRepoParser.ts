import { useState } from 'react';
import { parseQuery } from '../utils/parser';
import { ParsedQuery } from '../types/parser';

export function useRepoParser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);

  const parseRepository = async (
    source: string,
    options?: {
      maxFileSize?: number;
      includePatterns?: string | Set<string>;
      ignorePatterns?: string | Set<string>;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await parseQuery(source, options);
      setParsedQuery(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to parse repository');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    parsedQuery,
    parseRepository
  };
} 