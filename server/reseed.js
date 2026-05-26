require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function reseed() {
  try {
    console.log('Reading seed_recipes.sql...');
    const sqlPath = path.join(__dirname, 'database', 'seed_recipes.sql');
    
    // Read with UTF-16LE encoding and strip BOM if present
    let sql = fs.readFileSync(sqlPath, 'utf16le');
    if (sql.charCodeAt(0) === 0xFEFF) {
      sql = sql.slice(1);
    }
    
    // Split into individual queries (handling potential multiple lines and windows line endings)
    const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);
    
    console.log(`Found ${queries.length} queries. Executing on cloud DB...`);
    
    for (let query of queries) {
      try {
        await db.query(query);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_TABLE_EXISTS_ERROR') {
          // Ignore duplicate entries
        } else {
          console.error('Error executing query:', err.message);
        }
      }
    }
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

reseed();
