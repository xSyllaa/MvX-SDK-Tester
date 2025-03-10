import NextAuth from 'next-auth';
import { authOptions } from './options';

// Création des gestionnaires de route NextAuth
const handler = NextAuth(authOptions);

// Exportation des gestionnaires HTTP valides pour Next.js
export { handler as GET, handler as POST }; 