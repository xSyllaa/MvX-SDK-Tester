const fs = require('fs');
const fetch = require('node-fetch');

// La requête SQL pour créer la table users
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
`;

// Fonction pour exécuter une requête SQL via l'API MCP
async function executeSql(sql) {
  try {
    console.log('Exécution de la requête SQL...');
    console.log(sql);
    
    const response = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const result = await response.json();
    console.log('Réponse:', result);
    
    return result;
  } catch (error) {
    console.error('Erreur:', error);
    return { error: error.message };
  }
}

// Fonction principale
async function main() {
  try {
    // Créer la table users
    const result = await executeSql(createUsersTable);
    console.log('Résultat final:', result);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter le script
main(); 