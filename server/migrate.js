require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Adding dietary_tag to recipes table...');
    await db.query(`ALTER TABLE recipes ADD COLUMN dietary_tag ENUM('None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal') DEFAULT 'None'`);
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, ignoring.');
      process.exit(0);
    }
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
