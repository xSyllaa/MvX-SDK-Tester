'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

export function useSupabase() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Réinitialiser les erreurs quand la session change
  useEffect(() => {
    setError(null);
  }, [session]);

  // Fonction pour exécuter des requêtes SQL sécurisées via RPC
  const executeSql = async <T>(sqlQuery: string): Promise<{ data: T | null; error: Error | null }> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseClient.rpc('execute_sql', { 
        sql_query: sqlQuery 
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('SQL Execution error:', err);
      setError(err as Error);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  return {
    supabase: supabaseClient,
    loading,
    error,
    executeSql
  };
} 