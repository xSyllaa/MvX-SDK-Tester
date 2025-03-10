import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

// Spécifier que ce middleware doit s'exécuter dans l'environnement Node.js et non Edge
export const runtime = 'nodejs';

// Routes qui n'ont pas besoin d'authentification
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/anonymous',
  '/api/auth/link-account'
];

// Routes d'API qui n'ont pas besoin d'authentification
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/anonymous',
  '/api/auth/link-account'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route publique
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      pathname.includes('_next') || 
      pathname.includes('favicon') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js')) {
    return NextResponse.next();
  }

  // Récupérer le token d'authentification
  const authToken = request.cookies.get('auth_token')?.value;

  if (!authToken) {
    // Si c'est une API d'authentification anonyme, laisser passer
    if (pathname === '/api/auth/anonymous') {
      return NextResponse.next();
    }
    
    // Rediriger vers la page de connexion pour les routes non-API
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Renvoyer une erreur 401 pour les routes API
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Vérifier la validité du token (ceci est fait dans une fonction séparée pour le middleware)
    const isValidToken = await validateAuthToken(authToken);
    
    if (!isValidToken) {
      // Supprimer le cookie et rediriger
      const response = pathname.startsWith('/api/') 
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
      
      response.cookies.delete('auth_token');
      return response;
    }
    
    // Token valide, continuer
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // En cas d'erreur, rediriger ou renvoyer 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 500 });
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Fonction pour valider le token d'authentification
async function validateAuthToken(token: string): Promise<boolean> {
  // Établir la connexion à la base de données
  const sql = postgres(process.env.DATABASE_URL || '');
  
  try {
    // Vérifier si le token existe et n'est pas expiré
    const sessions = await sql`
      SELECT s.*, u.id as user_id
      FROM "sessions" s
      JOIN "users" u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;
    
    return sessions.length > 0;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  } finally {
    // Fermer la connexion à la base de données
    await sql.end();
  }
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 