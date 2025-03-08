require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Fonction pour exécuter une requête SQL via l'API MCP
async function executeSql(sql) {
  try {
    console.log('Exécution de la mise à jour du schéma via le serveur MCP...');
    
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
    // Lire le fichier SQL contenant la mise à jour du schéma
    const sqlPath = path.join(__dirname, 'components-schema-update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Mise à jour du schéma des composants dans Supabase...');
    
    // Exécuter le SQL
    const result = await executeSql(sqlContent);
    
    if (result.error) {
      console.error('Erreur lors de la mise à jour du schéma:', result.error);
    } else {
      console.log('Schéma mis à jour avec succès!');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du schéma:', error);
  }
}

// Exécuter le script
main(); 