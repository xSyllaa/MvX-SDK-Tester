import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export type SDKFavorite = {
  sdk_name: string;
  favorite_count: number;
};

export function useSdkFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sdkList, setSdkList] = useState<SDKFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger la liste globale des SDKs avec leurs compteurs
  useEffect(() => {
    const loadSdkList = async () => {
      try {
        const response = await fetch('/api/favorites/counts');
        if (!response.ok) throw new Error('Failed to load SDK list');
        const data = await response.json();
        setSdkList(data);
      } catch (error) {
        console.error('Error loading SDK list:', error);
        setError('Failed to load SDK list');
      }
    };

    loadSdkList();
  }, []); // Chargé une seule fois au montage

  // Charger les favoris de l'utilisateur une fois authentifié
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const loadUserFavorites = async () => {
      try {
        const response = await fetch(`/api/favorites/user/${user.id}`);
        if (!response.ok) throw new Error('Failed to load user favorites');
        const data = await response.json();
        setFavorites(data.map((f: { sdk_name: string }) => f.sdk_name));
      } catch (error) {
        console.error('Error loading user favorites:', error);
        setError('Failed to load your favorites');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFavorites();
  }, [user]); // Rechargé uniquement quand l'utilisateur change

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
      setFavorites(prev => 
        isCurrentlyFavorited 
          ? prev.filter(f => f !== sdkName)
          : [...prev, sdkName]
      );

      // Mise à jour optimiste du compteur global
      setSdkList(prev => 
        prev.map(sdk => 
          sdk.sdk_name === sdkName 
            ? { 
                ...sdk, 
                favorite_count: sdk.favorite_count + (isCurrentlyFavorited ? -1 : 1) 
              }
            : sdk
        )
      );

      // Recharger les compteurs en arrière-plan
      const countsResponse = await fetch('/api/favorites/counts');
      if (countsResponse.ok) {
        const newData = await countsResponse.json();
        setSdkList(newData);
      }

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