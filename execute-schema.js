const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Fonction pour lire le fichier SQL
async function readSqlFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Fonction pour exécuter une requête SQL via l'API MCP
async function executeSql(sql) {
  try {
    console.log('Exécution du script SQL via le serveur MCP...');
    
    const response = await fetch('http://localhost:8765/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Script SQL exécuté avec succès!');
      console.log('Résultat:', JSON.stringify(result, null, 2));
      return { success: true, result };
    } else {
      console.error('Erreur lors de l\'exécution du script SQL:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Erreur de connexion au serveur MCP:', error.message);
    return { success: false, error: error.message };
  }
}

// Fonction principale
async function main() {
  try {
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, 'auth-schema.sql');
    const sqlScript = await readSqlFile(sqlFilePath);
    
    // Exécuter le script SQL
    const result = await executeSql(sqlScript);
    
    if (result.success) {
      console.log('Les tables d\'authentification ont été créées avec succès dans Supabase!');
    } else {
      console.error('Échec de la création des tables:', result.error);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// Exécuter le script
main(); 