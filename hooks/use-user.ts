import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

/**
 * Interface représentant les données de l'utilisateur
 * 
 * @property id - Identifiant unique de l'utilisateur
 * @property name - Nom d'affichage de l'utilisateur
 * @property email - Adresse email de l'utilisateur
 * @property image - URL optionnelle vers l'avatar de l'utilisateur
 * @property joinDate - Date d'inscription au format ISO
 * @property plan - Plan d'abonnement actuel de l'utilisateur
 * @property isLoading - Indique si les données sont en cours de chargement
 * @property isAuthenticated - Indique si l'utilisateur est authentifié
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  joinDate: string;
  plan: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook personnalisé pour gérer l'authentification et les données utilisateur
 * 
 * Ce hook unifie les données provenant de NextAuth et du contexte d'authentification personnalisé,
 * offrant une interface unique pour accéder aux informations de l'utilisateur et gérer l'authentification.
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
 *   - userData: Les informations combinées de l'utilisateur
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
  const { data: session, status: nextAuthStatus } = useSession();
  const { user, isReallyAuthenticated, isLoading: authLoading, logout: authLogout } = useAuth();
  const router = useRouter();

  // Déterminer si l'utilisateur est authentifié (via NextAuth ou notre système personnalisé)
  const isAuthenticated = isReallyAuthenticated || (nextAuthStatus === 'authenticated');
  const isLoading = authLoading || nextAuthStatus === 'loading';

  // Combiner les informations des deux sources
  const userData: UserData = {
    id: user?.id || 'user-1',
    name: user?.displayName || session?.user?.name || user?.username || 'User',
    email: user?.email || session?.user?.email || 'user@example.com',
    image: user?.avatarUrl || session?.user?.image || undefined,
    joinDate: '2023-01-01T00:00:00Z', // Valeur par défaut car ni User ni session ne contiennent joinDate
    plan: 'Free Plan', // Valeur par défaut car ni User ni session ne contiennent plan
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
    router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  return {
    userData,
    isLoading,
    isAuthenticated,
    logout,
    redirectToLogin
  };
} 