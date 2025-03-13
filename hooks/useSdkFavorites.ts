import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

export type SDKFavorite = {
  sdk_name: string;
  favorite_count: number;
};

// Cache global pour stocker les résultats des API
const globalCache = {
  counts: null as SDKFavorite[] | null,
  userFavorites: {} as Record<string, string[]>,
  lastUpdated: {
    counts: 0,
    userFavorites: {} as Record<string, number>
  }
};

// Durée pendant laquelle le cache reste valide (5 minutes en ms)
const CACHE_DURATION = 5 * 60 * 1000;

export function useSdkFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sdkList, setSdkList] = useState<SDKFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Utiliser une ref pour éviter des appels multiples en parallèle
  const loadingCountsRef = useRef(false);
  const loadingFavoritesRef = useRef(false);

  // Fonction pour charger les compteurs globaux avec gestion du cache
  const loadSdkList = useCallback(async (forceRefresh = false) => {
    // Si déjà en cours de chargement, ne pas lancer un autre appel
    if (loadingCountsRef.current) return;
    
    // Vérifier si le cache est valide et non forcé à se rafraîchir
    const now = Date.now();
    if (!forceRefresh && 
        globalCache.counts && 
        now - globalCache.lastUpdated.counts < CACHE_DURATION) {
      setSdkList(globalCache.counts);
      return;
    }
    
    loadingCountsRef.current = true;
    try {
      const response = await fetch('/api/favorites/counts');
      if (!response.ok) throw new Error('Failed to load SDK list');
      const data = await response.json();
      
      // Mettre à jour le cache global
      globalCache.counts = data;
      globalCache.lastUpdated.counts = now;
      
      setSdkList(data);
    } catch (error) {
      console.error('Error loading SDK list:', error);
      setError('Failed to load SDK list');
    } finally {
      loadingCountsRef.current = false;
    }
  }, []);

  // Fonction pour charger les favoris utilisateur avec gestion du cache
  const loadUserFavorites = useCallback(async (userId: string, forceRefresh = false) => {
    // Si déjà en cours de chargement, ne pas lancer un autre appel
    if (loadingFavoritesRef.current) return;
    
    // Vérifier si le cache est valide et non forcé à se rafraîchir
    const now = Date.now();
    if (!forceRefresh && 
        globalCache.userFavorites[userId] && 
        globalCache.lastUpdated.userFavorites[userId] && 
        now - globalCache.lastUpdated.userFavorites[userId] < CACHE_DURATION) {
      setFavorites(globalCache.userFavorites[userId]);
      setIsLoading(false);
      return;
    }
    
    loadingFavoritesRef.current = true;
    try {
      const response = await fetch(`/api/favorites/user/${userId}`);
      if (!response.ok) throw new Error('Failed to load user favorites');
      const data = await response.json();
      const favList = data.map((f: { sdk_name: string }) => f.sdk_name);
      
      // Mettre à jour le cache global
      globalCache.userFavorites[userId] = favList;
      globalCache.lastUpdated.userFavorites[userId] = now;
      
      setFavorites(favList);
    } catch (error) {
      console.error('Error loading user favorites:', error);
      setError('Failed to load your favorites');
    } finally {
      setIsLoading(false);
      loadingFavoritesRef.current = false;
    }
  }, []);

  // Charger la liste globale des SDKs avec leurs compteurs (une seule fois)
  useEffect(() => {
    loadSdkList();
  }, []); // Chargé une seule fois au montage

  // Charger les favoris de l'utilisateur une fois authentifié
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    loadUserFavorites(user.id);
  }, [user, loadUserFavorites]); // Rechargé uniquement quand l'utilisateur change

  const toggleFavorite = async (sdkName: string) => {
    if (!user || loadingStates[sdkName]) return;
    
    setLoadingStates(prev => ({ ...prev, [sdkName]: true }));
    setError(null);

    const isCurrentlyFavorited = favorites.includes(sdkName);
    const method = isCurrentlyFavorited ? 'DELETE' : 'POST';

    try {
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdkName }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      // Mise à jour optimiste des favoris de l'utilisateur
      const newFavorites = isCurrentlyFavorited 
        ? favorites.filter(f => f !== sdkName)
        : [...favorites, sdkName];
      
      setFavorites(newFavorites);
      
      // Mettre à jour également le cache pour éviter des rechargements inutiles
      if (user) {
        globalCache.userFavorites[user.id] = newFavorites;
        globalCache.lastUpdated.userFavorites[user.id] = Date.now();
      }

      // Mise à jour optimiste du compteur global
      const updatedSdkList = sdkList.map(sdk => 
        sdk.sdk_name === sdkName 
          ? { 
              ...sdk, 
              favorite_count: sdk.favorite_count + (isCurrentlyFavorited ? -1 : 1) 
            }
          : sdk
      );
      
      setSdkList(updatedSdkList);
      
      // Mettre à jour également le cache pour éviter des rechargements inutiles
      globalCache.counts = updatedSdkList;
      globalCache.lastUpdated.counts = Date.now();

      // Recharger les compteurs en arrière-plan avec délai pour éviter surcharge
      setTimeout(() => {
        loadSdkList(true);
      }, 1000);

    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite');
      
      // Restaurer l'état précédent en cas d'erreur
      setFavorites(prev => 
        isCurrentlyFavorited 
          ? [...prev, sdkName]
          : prev.filter(f => f !== sdkName)
      );
      
      setSdkList(prev => [...prev]); // Restaurer l'état précédent
    } finally {
      setLoadingStates(prev => ({ ...prev, [sdkName]: false }));
    }
  };

  return {
    // Liste des favoris de l'utilisateur
    favorites,
    // Liste globale des SDKs triée par nombre de favoris
    sdkList,
    isLoading,
    error,
    toggleFavorite,
    isFavorite: (sdkName: string) => favorites.includes(sdkName),
    isToggling: (sdkName: string) => loadingStates[sdkName] || false
  };
} 