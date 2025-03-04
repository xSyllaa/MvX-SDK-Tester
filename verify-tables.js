const fetch = require('node-fetch');

// Fonction pour lister toutes les tables
async function listTables() {
  try {
    console.log("Récupération de la liste des tables...");
    
    const response = await fetch('http://localhost:8765/tables');
    const result = await response.json();
    
    if (result.tables && Array.isArray(result.tables)) {
      console.log("\n=== TABLES CRÉÉES DANS SUPABASE ===");
      result.tables.forEach(table => {
        console.log(`- ${table}`);
      });
      
      // Vérifier que toutes nos tables sont présentes
      const requiredTables = ['users', 'auth_methods', 'user_auth_methods', 'sessions', 'account_links'];
      const missingTables = requiredTables.filter(table => !result.tables.includes(table));
      
      if (missingTables.length === 0) {
        console.log("\n✅ Toutes les tables requises ont été créées avec succès!");
      } else {
        console.log("\n⚠️ Tables manquantes:", missingTables.join(', '));
      }
      
      return result.tables;
    } else {
      console.error("Erreur lors de la récupération des tables:", result.error || "Format de réponse incorrect");
      return [];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des tables:", error.message);
    return [];
  }
}

// Fonction pour obtenir le schéma d'une table
async function getTableSchema(tableName) {
  try {
    console.log(`\nRécupération du schéma de la table ${tableName}...`);
    
    const response = await fetch(`http://localhost:8765/tables/${tableName}/schema`);
    const result = await response.json();
    
    if (result.columns && Array.isArray(result.columns)) {
      console.log(`\n=== SCHÉMA DE LA TABLE ${tableName.toUpperCase()} ===`);
      result.columns.forEach(column => {
        console.log(`- ${column.name} (${column.type})`);
      });
      return result.columns;
    } else {
      console.error(`Erreur lors de la récupération du schéma de ${tableName}:`, result.error || "Format de réponse incorrect");
      return [];
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du schéma de ${tableName}:`, error.message);
    return [];
  }
}

// Fonction principale
async function verifyTables() {
  try {
    // Lister toutes les tables
    const tables = await listTables();
    
    if (tables.length > 0) {
      // Obtenir le schéma de chaque table
      for (const table of ['users', 'auth_methods', 'user_auth_methods', 'sessions', 'account_links']) {
        if (tables.includes(table)) {
          await getTableSchema(table);
        }
      }
    }
  } catch (error) {
    console.error("Erreur globale:", error.message);
  }
}

// Exécuter le script
verifyTables(); 