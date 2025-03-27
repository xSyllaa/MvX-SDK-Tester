import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

/**
 * Interface représentant les données de l'utilisateur
 * 
 * @property id - Identifiant unique de l'utilisateur
 * @property name - Nom d'affichage de l'utilisateur
 * @property email - Adresse email de l'utilisateur
 * @property image - URL optionnelle vers l'avatar de l'utilisateur
 * @property created_at - Date de création au format ISO
 * @property plan - Plan d'abonnement actuel de l'utilisateur
 * @property isLoading - Indique si les données sont en cours de chargement
 * @property isAuthenticated - Indique si l'utilisateur est authentifié
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  created_at: string;
  plan: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook personnalisé pour gérer l'authentification et les données utilisateur
 * 
 * Ce hook utilise le système d'authentification Supabase personnalisé pour accéder 
 * aux informations de l'utilisateur et gérer l'authentification.
 * 
 * @example
 * ```tsx
 * function ProfileComponent() {
 *   const { userData, isAuthenticated, logout } = useUser();
 *   
 *   if (!isAuthenticated) {
 *     return <p>Veuillez vous connecter</p>;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>Bienvenue, {userData.name}</h1>
 *       <button onClick={logout}>Déconnexion</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns Un objet contenant:
 *   - userData: Les informations de l'utilisateur
 *   - isLoading: Indique si l'authentification est en cours de vérification
 *   - isAuthenticated: Indique si l'utilisateur est authentifié
 *   - logout: Fonction pour déconnecter l'utilisateur
 *   - redirectToLogin: Fonction pour rediriger vers la page de connexion avec une URL de callback
 */
export function useUser(): {
  userData: UserData;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  redirectToLogin: (callbackUrl?: string) => void;
} {
  const { session, isAuthenticated, isLoading, logout: authLogout } = useAuth();
  const router = useRouter();

  // Récupérer les données utilisateur depuis la session Supabase
  const user = session?.user;

  // Préparer les données utilisateur
  const userData: UserData = {
    id: user?.id || 'user-1',
    name: user?.displayName || user?.username || 'User',
    email: user?.email || 'user@example.com',
    image: user?.avatarUrl || undefined,
    created_at: user?.created_at || new Date().toISOString(),
    plan: 'Free Plan', // Valeur par défaut
    isLoading,
    isAuthenticated
  };

  /**
   * Déconnecte l'utilisateur et le redirige vers la page d'accueil
   */
  const logout = async () => {
    await authLogout();
    router.push('/');
  };

  /**
   * Redirige l'utilisateur vers la page de connexion avec une URL de callback
   * 
   * @param callbackUrl - URL vers laquelle rediriger après connexion (par défaut: '/account')
   */
  const redirectToLogin = (callbackUrl = '/account') => {
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  return {
    userData,
    isLoading,
    isAuthenticated,
    logout,
    redirectToLogin
  };
} 