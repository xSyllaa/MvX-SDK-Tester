require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function readSqlFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

async function executeSql(sql) {
  const db = postgres(process.env.DATABASE_URL, {
    max: 1,
  });

  try {
    const result = await db.unsafe(sql);
    console.log('SQL execution completed successfully');
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    await db.end();
  }
}

async function main() {
  try {
    // Lire le fichier SQL contenant les règles RLS
    const sqlPath = path.join(__dirname, 'auth-rls.sql');
    const sqlContent = await readSqlFile(sqlPath);
    
    console.log('Applying RLS rules to Supabase database...');
    
    // Exécuter le SQL
    await executeSql(sqlContent);
    
    console.log('RLS rules applied successfully');
  } catch (error) {
    console.error('Error applying RLS rules:', error);
    process.exit(1);
  }
}

main(); 