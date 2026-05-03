require('dotenv').config();
const axios = require('axios');
const db = require('./config/db');

async function seed() {
  const targetCount = 200;
  const seenIds = new Set();
  let addedCount = 0;

  console.log('Starting TheMealDB scraper to fetch 200 authentic recipes...');

  while (addedCount < targetCount) {
    try {
      const { data } = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
      if (!data.meals) continue;
      const meal = data.meals[0];

      if (seenIds.has(meal.idMeal)) continue;
      seenIds.add(meal.idMeal);

      // Process ingredients
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (name && name.trim()) {
          ingredients.push({ name: name.trim(), measure: measure ? measure.trim() : '' });
        }
      }

      // Assign realistic/thought-out values
      const mood = meal.strCategory === 'Dessert' ? 'indulgent' : (['Vegan', 'Vegetarian', 'Seafood'].includes(meal.strCategory) ? 'healthy' : 'comfort');
      const difficulty = meal.strInstructions.length > 800 ? 'Hard' : (meal.strInstructions.length < 300 ? 'Easy' : 'Medium');
      const estCost = 200 + (ingredients.length * 45); // e.g. 10 ings = 650 PKR
      
      let dietary = 'None';
      if (meal.strCategory === 'Vegan') dietary = 'Vegan';
      else if (meal.strCategory === 'Vegetarian') dietary = 'Vegetarian';

      const prepTime = Math.floor(Math.random() * 20) + 10; // 10 to 30 mins
      const cookTime = Math.floor(Math.random() * 40) + 10; // 10 to 50 mins

      // Clean up description (truncate if too long or construct a good one)
      let desc = `An authentic ${meal.strArea || 'global'} ${meal.strCategory || 'dish'} that is perfect for any occasion.`;
      if (meal.strTags) {
        desc += ` Features: ${meal.strTags.split(',').join(', ')}.`;
      }

      // 1. Insert Recipe
      const [result] = await db.query(
        `INSERT INTO recipes (title, description, mood_tag, cuisine, category, difficulty, prep_time_minutes, cook_time_minutes, servings, estimated_cost, is_trending, image_url, dietary_tag) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          meal.strMeal,
          desc,
          mood,
          meal.strArea || 'Other',
          meal.strCategory || 'Main Course',
          difficulty,
          prepTime,
          cookTime,
          Math.floor(Math.random() * 3) + 2, // 2 to 4 servings
          estCost,
          Math.random() > 0.8, // 20% chance to be trending
          meal.strMealThumb,
          dietary
        ]
      );

      const recipeId = result.insertId;

      // 2. Insert Ingredients
      for (const ing of ingredients) {
        await db.query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit) VALUES (?, ?, ?, ?)`,
          [recipeId, ing.name, ing.measure, '']
        );
      }

      // 3. Insert Steps
      const steps = meal.strInstructions.split(/(?:\r?\n)+/).filter(s => s.trim().length > 3);
      for (let i = 0; i < steps.length; i++) {
        await db.query(
          `INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)`,
          [recipeId, i + 1, steps[i].trim()]
        );
      }

      addedCount++;
      if (addedCount % 20 === 0) {
        console.log(`Successfully imported ${addedCount} / ${targetCount} recipes...`);
      }
      
      // Tiny delay to be nice to the free API
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (err) {
      console.error('Error fetching/inserting meal:', err.message);
    }
  }

  console.log(`\n🎉 DONE! Added ${addedCount} authentic recipes from TheMealDB to your database!`);
  process.exit(0);
}

seed();
