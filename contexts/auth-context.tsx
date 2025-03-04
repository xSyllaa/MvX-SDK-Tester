'use client';

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface User {
  id: string;
  email?: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isAnonymous: boolean;
}

interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  isReallyAuthenticated: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithCredentials: (email: string, password: string, username?: string, displayName?: string, anonymousToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

// Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | null>(null);

// Variable globale pour suivre l'état de l'initialisation
let isGlobalInitializing = false;
let lastInitAttempt = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAnonymous: false,
    isLoading: true,
    error: null,
    isInitialized: false
  });

  // Référence pour savoir si le composant est monté
  const isMounted = useRef(true);
  
  // Référence à l'état pour pouvoir y accéder dans les callbacks async
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Fonction utilitaire pour récupérer un cookie
  const getCookie = (name: string): string => {
    if (typeof document === 'undefined') return '';
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  // Fonction pour vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    console.log('🔎 [AuthContext] Vérification du statut d\'authentification');
    
    // Éviter les vérifications multiples simultanées
    const now = Date.now();
    if (isGlobalInitializing) {
      console.log('⏳ [AuthContext] Une vérification est déjà en cours, attente...');
      return;
    }
    
    // Éviter les vérifications trop rapprochées (max 1 fois par seconde)
    if (now - lastInitAttempt < 1000) {
      console.log('⏱️ [AuthContext] Vérification trop rapprochée, attente...');
      return;
    }
    
    isGlobalInitializing = true;
    lastInitAttempt = now;
    
    try {
      if (!isMounted.current) {
        isGlobalInitializing = false;
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Vérifier si un cookie d'authentification existe
      const authToken = getCookie('auth_token');
      if (authToken) {
        console.log('🍪 [AuthContext] Cookie d\'authentification trouvé, vérification...');
      }
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (!isMounted.current) {
        isGlobalInitializing = false;
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AuthContext] Utilisateur authentifié:', data.user);
        setState({
          user: data.user,
          isAuthenticated: true,
          isAnonymous: data.user.isAnonymous,
          isLoading: false,
          error: null,
          isInitialized: true
        });
      } else {
        console.log('🔑 [AuthContext] Aucun utilisateur authentifié, création d\'un compte anonyme...');
        // Pas d'utilisateur connecté, créer un utilisateur anonyme
        await loginAnonymously();
      }
    } catch (error) {
      if (!isMounted.current) {
        isGlobalInitializing = false;
        return;
      }
      
      console.error('❌ [AuthContext] Erreur lors de la vérification de l\'authentification:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check authentication status',
        isInitialized: true
      }));
    } finally {
      isGlobalInitializing = false;
    }
  };

  // Fonction pour la connexion anonyme
  const loginAnonymously = async () => {
    if (!isMounted.current) return;
    
    console.log('🔑 [AuthContext] Début de l\'authentification anonyme...');
    setState(prev => ({...prev, isLoading: true, error: null}));
    
    try {
      console.log('📡 [AuthContext] Envoi de la requête d\'authentification anonyme...');
      const response = await fetch('/api/auth/anonymous', {
        method: 'POST',
        credentials: 'include'
      });

      if (!isMounted.current) return;

      const data: AuthResponse = await response.json();
      console.log('📩 [AuthContext] Réponse reçue pour l\'authentification anonyme:', data.message);
      
      if (data.success) {
        console.log('✅ [AuthContext] Authentification anonyme réussie!');
        setState({
          user: data.user,
          isAuthenticated: true,
          isAnonymous: true,
          isLoading: false,
          error: null,
          isInitialized: true
        });
      } else {
        console.error('❌ [AuthContext] Échec de l\'authentification anonyme:', data.message);
        setState({
          user: null,
          isAuthenticated: false,
          isAnonymous: false,
          isLoading: false,
          error: data.message || 'Failed to create anonymous user',
          isInitialized: true
        });
      }
    } catch (error) {
      if (!isMounted.current) return;
      
      console.error('💥 [AuthContext] Erreur critique lors de l\'authentification anonyme:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isAnonymous: false,
        isLoading: false,
        error: 'Failed to create anonymous user',
        isInitialized: true
      });
    }
  };

  // Fonction pour la connexion par identifiants
  const loginWithCredentials = async (email: string, password: string) => {
    if (!isMounted.current) return { success: false };
    
    setState(prev => ({...prev, isLoading: true, error: null}));
    
    try {
      // Si l'utilisateur est déjà authentifié en anonyme, mettre à niveau le compte
      if (state.user && state.isAnonymous) {
        console.log('🔄 [AuthContext] Conversion d\'un compte anonyme en compte complet...');
        return await upgradeAnonymousAccount('email_password', {
          email,
          password
        });
      }
      
      // Sinon, connexion normale
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!isMounted.current) return { success: false };

      const data = await response.json();
      
      if (data.success) {
        setState({
          user: data.user,
          isAuthenticated: true,
          isAnonymous: data.user.isAnonymous,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Invalid credentials'
        }));
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (error) {
      if (!isMounted.current) return { success: false };
      
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to login'
      }));
      return { success: false, error: 'Failed to login' };
    }
  };

  // Fonction pour l'inscription
  const registerWithCredentials = async (email: string, password: string, username?: string, displayName?: string, anonymousToken?: string) => {
    if (!isMounted.current) return { success: false };
    
    setState(prev => ({...prev, isLoading: true, error: null}));
    
    try {
      console.log('Starting registration with credentials:', { email, username, displayName, hasAnonymousToken: !!anonymousToken });
      
      // Déterminer si nous devons transformer le compte anonyme ou créer un nouveau compte
      const shouldUpgradeAnonymous = !!anonymousToken;
      
      if (shouldUpgradeAnonymous) {
        console.log('Upgrading anonymous account with token');
        // Mettre à niveau le compte anonyme existant
        const response = await fetch('/api/auth/link-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authMethod: 'credentials',
            anonymousToken,
            data: {
              email,
              password,
              username,
              displayName
            }
          }),
          credentials: 'include'
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error('Error upgrading anonymous account:', result);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: result.message || 'Failed to upgrade anonymous account' 
          }));
          return { success: false, error: result.message };
        }
        
        console.log('Anonymous account upgraded successfully:', result);
        // Mettre à jour l'état d'authentification avec les nouvelles informations
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          isAnonymous: false,
          user: result.user
        }));
        
        return { success: true };
      } else {
        // Enregistrer un nouveau compte (comportement existant)
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            username,
            displayName
          }),
          credentials: 'include'
        });

        const result = await response.json();
        
        if (!response.ok) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: result.message || 'Failed to register' 
          }));
          return { success: false, error: result.message };
        }
        
        // Mettre à jour l'état d'authentification
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          isAnonymous: false,
          user: result.user
        }));
        
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur s\'est produite lors de l\'inscription';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Fonction pour la déconnexion
  const logout = async () => {
    if (!isMounted.current) return;
    
    setState(prev => ({...prev, isLoading: true}));
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Après la déconnexion, créer un nouvel utilisateur anonyme
      console.log('🔄 [AuthContext] Déconnexion réussie, création d\'un nouveau compte anonyme...');
      await loginAnonymously();
    } catch (error) {
      if (!isMounted.current) return;
      
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to logout'
      }));
    }
  };

  // Fonction pour mettre à niveau un compte anonyme
  const upgradeAnonymousAccount = async (
    authMethod: string, 
    data: { email: string; password: string; username?: string; displayName?: string }
  ) => {
    if (!isMounted.current) return { success: false };
    
    if (!state.user || !state.isAnonymous) {
      return { success: false, error: 'No anonymous account to upgrade' };
    }
    
    setState(prev => ({...prev, isLoading: true, error: null}));
    
    try {
      const response = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          anonymousToken: getCookie('auth_token'),
          authMethod,
          ...data
        }),
        credentials: 'include'
      });

      if (!isMounted.current) return { success: false };

      const responseData = await response.json();
      
      if (responseData.success) {
        console.log('✅ [AuthContext] Mise à niveau du compte anonyme réussie!', responseData.user);
        setState({
          user: responseData.user,
          isAuthenticated: true,
          isAnonymous: false,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return { success: true };
      } else {
        console.error('❌ [AuthContext] Échec de la mise à niveau du compte anonyme:', responseData.error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: responseData.error || 'Failed to upgrade account'
        }));
        return { success: false, error: responseData.error || 'Failed to upgrade account' };
      }
    } catch (error) {
      if (!isMounted.current) return { success: false };
      
      console.error('Account upgrade error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to upgrade account'
      }));
      return { success: false, error: 'Failed to upgrade account' };
    }
  };

  // Fonction pour rafraîchir l'état d'authentification
  const refreshAuthState = async () => {
    if (isGlobalInitializing) return;
    await checkAuthStatus();
  };

  // Initialisation au chargement du contexte
  useEffect(() => {
    isMounted.current = true;
    
    // Retarder légèrement la vérification pour éviter les conditions de course
    const timer = setTimeout(() => {
      if (!state.isInitialized && !isGlobalInitializing) {
        checkAuthStatus();
      }
    }, 50);
    
    return () => {
      clearTimeout(timer);
      isMounted.current = false;
    };
  }, []);

  // Valeur du contexte
  const contextValue: AuthContextType = {
    ...state,
    isReallyAuthenticated: state.isAuthenticated && !state.isAnonymous,
    loginWithCredentials,
    registerWithCredentials,
    logout,
    refreshAuthState
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 