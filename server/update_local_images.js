require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateLocalImages() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'moodmeal'
  });

  try {
    const recipesDir = path.join(__dirname, '../client/public/recipes');
    if (!fs.existsSync(recipesDir)) {
      console.log('Recipes directory does not exist:', recipesDir);
      return;
    }

    const files = fs.readdirSync(recipesDir);
    let updatedCount = 0;

    for (const file of files) {
      // Parse ID from filename (e.g. 1.jpg -> 1)
      const parsedId = parseInt(file.split('.')[0], 10);

      if (!isNaN(parsedId)) {
        const imageUrl = `/recipes/${file}`;
        await db.query(`UPDATE recipes SET image_url = ? WHERE id = ?`, [imageUrl, parsedId]);
        updatedCount++;
        console.log(`Updated recipe ${parsedId} with image ${imageUrl}`);
      }
    }

    console.log(`\nSuccessfully linked ${updatedCount} local images to the database!`);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await db.end();
  }
}

updateLocalImages();
