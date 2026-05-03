require('dotenv').config();
const db = require('./config/db');

async function insertRecipes() {
  try {
    console.log("Inserting featured recipes...");
    
    // Check if they already exist
    const [rows] = await db.query("SELECT * FROM recipes WHERE title IN ('Chicken Sandwich', 'Apple Smoothie', 'Chicken Parmesan')");
    if (rows.length > 0) {
      console.log("Some recipes already exist. Deleting old ones to avoid duplicates...");
      await db.query("DELETE FROM recipes WHERE title IN ('Chicken Sandwich', 'Apple Smoothie', 'Chicken Parmesan')");
    }

    await db.query(`
      INSERT INTO recipes (title, description, category, mood_tag, cuisine, difficulty, prep_time_minutes, cook_time_minutes, estimated_cost)
      VALUES 
      ('Chicken Sandwich', 'A classic hearty chicken sandwich with lettuce and mayo', 'Snack', 'comfort', 'Western', 'Easy', 10, 10, 250),
      ('Apple Smoothie', 'Fresh and healthy apple smoothie with a hint of cinnamon', 'Breakfast', 'healthy', 'Western', 'Easy', 5, 0, 150),
      ('Chicken Parmesan', 'Breaded chicken breast topped with marinara and melted parmesan', 'Main Course', 'indulgent', 'Italian', 'Medium', 15, 25, 450)
    `);
    
    console.log("Recipes inserted successfully!");
  } catch (err) {
    console.error("Error inserting recipes:", err);
  } finally {
    process.exit();
  }
}

insertRecipes();
