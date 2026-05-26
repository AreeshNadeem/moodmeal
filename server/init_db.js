require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function initDB() {
  try {
    console.log('Reading schema.sql...');
    const sqlPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual queries, removing comments
    const queries = sql
      .split(';')
      .map(q => q.replace(/--.*$/gm, '').trim())
      .filter(q => q.length > 0 && !q.startsWith('USE') && !q.startsWith('CREATE DATABASE'));
    
    console.log(`Executing ${queries.length} schema queries on cloud DB...`);
    
    for (let query of queries) {
      try {
        await db.query(query);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          // Ignore
        } else {
          console.error('Error executing schema query:', err.message);
        }
      }
    }
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

initDB();
