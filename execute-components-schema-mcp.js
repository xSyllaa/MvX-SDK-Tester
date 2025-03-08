require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Fonction pour exécuter une requête SQL via l'API MCP
async function executeSql(sql) {
  try {
    console.log('Exécution du schéma SQL via le serveur MCP...');
    
    const response = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`MCP server error: ${JSON.stringify(result)}`);
    }
    
    console.log('Réponse du serveur MCP:', result);
    return result;
  } catch (error) {
    console.error('Erreur:', error);
    return { error: error.message };
  }
}

// Fonction principale
async function main() {
  try {
    // Lire le fichier SQL contenant le schéma des composants
    const sqlPath = path.join(__dirname, 'components-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Création des tables de composants dans Supabase...');
    
    // Exécuter le SQL
    const result = await executeSql(sqlContent);
    
    if (result.error) {
      console.error('Erreur lors de la création des tables:', result.error);
    } else {
      console.log('Tables de composants créées avec succès!');
    }
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
  }
}

// Exécuter le script
main(); 