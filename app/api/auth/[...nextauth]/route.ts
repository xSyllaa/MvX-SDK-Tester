import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';

// Types étendus pour la session et le JWT
interface ExtendedSession extends Session {
  accessToken?: string;
  provider?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

interface ExtendedJWT extends JWT {
  id?: string;
  accessToken?: string;
  provider?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // NOTE: Dans un environnement de production, vous devriez valider les identifiants 
        // par rapport à votre base de données
        
        // Exemple d'utilisateur pour le développement - À remplacer par une vraie validation
        if (credentials.email === 'user@example.com' && credentials.password === 'password') {
          return {
            id: '1',
            name: 'Test User',
            email: 'user@example.com',
          };
        }
        
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/', // Utilisation de la modal au lieu d'une page dédiée
    signOut: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Ajouter des informations personnalisées au JWT si nécessaire
      if (user) {
        token.id = user.id;
      }
      
      // Ajouter le token d'accès pour les providers OAuth
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      
      // Ajouter des informations personnalisées à la session
      if (extendedSession.user) {
        extendedSession.user.id = token.id as string;
      }
      
      // Ajouter le token d'accès à la session
      extendedSession.accessToken = token.accessToken as string;
      extendedSession.provider = token.provider as string;
      
      return extendedSession;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 