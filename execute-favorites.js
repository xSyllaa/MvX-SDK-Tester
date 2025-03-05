const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

// Créer le client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeFavoritesSchema() {
  try {
    // Lire le fichier SQL
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'favorites-schema.sql'),
      'utf8'
    );

    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: schemaSQL
    });

    if (error) throw error;

    console.log('✅ Schéma des favoris créé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création du schéma des favoris:', error);
    process.exit(1);
  }
}

// Exécuter le script
executeFavoritesSchema(); 