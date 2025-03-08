require('dotenv').config();
const fs = require('fs');
const postgres = require('postgres');
const path = require('path');

// Connexion à la base de données Supabase
const sql = postgres(process.env.DATABASE_URL);

async function createComponentsSchema() {
  try {
    console.log('Creating components schema...');
    // Lire le fichier SQL
    const schemaPath = path.join(__dirname, 'components-schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Exécuter le script SQL
    await sql.unsafe(schemaContent);
    console.log('Components schema created successfully!');
  } catch (error) {
    console.error('Error creating components schema:', error);
  } finally {
    // Fermer la connexion
    await sql.end();
  }
}

// Exécuter la fonction
createComponentsSchema(); 