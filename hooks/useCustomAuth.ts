'use client';

import { useAuth } from '@/contexts/auth-context';

// Hook de compatibilité pour faciliter la migration
export function useCustomAuth() {
  console.warn('⚠️ useCustomAuth est déprécié, veuillez utiliser useAuth du contexte auth-context à la place');
  return useAuth();
} 