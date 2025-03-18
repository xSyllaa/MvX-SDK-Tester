import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  max: 10, // Limiter le nombre maximal de connexions simultanées
  idle_timeout: 20, // Fermer les connexions après 20 secondes d'inactivité
  connect_timeout: 10, // 10 secondes de délai de connexion
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export default sql 