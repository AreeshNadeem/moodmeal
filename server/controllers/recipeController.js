const db = require('../config/db');

// Main recommendation engine — single bulk query, no N+1
exports.recommend = async (req, res) => {
  try {
    const { mood, max_time, max_cost, cuisine, difficulty, category, dietary, q } = req.query;

    // Get user pantry
    const [pantry] = await db.query(
      'SELECT name FROM pantry_items WHERE user_id = ?',
      [req.user.id]
    );
    const pantryNames = pantry.map(p => p.name.toLowerCase());

    // Build recipe filter query
    let query = 'SELECT * FROM recipes WHERE 1=1';
    const params = [];
    if (q) {
      query += ` AND (
        title LIKE ? 
        OR description LIKE ? 
        OR id IN (SELECT recipe_id FROM recipe_ingredients WHERE ingredient_name LIKE ?)
      )`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (mood) { query += ' AND mood_tag = ?'; params.push(mood); }
    if (max_time) { query += ' AND (prep_time_minutes + cook_time_minutes) <= ?'; params.push(Number(max_time)); }
    if (max_cost) { query += ' AND estimated_cost <= ?'; params.push(Number(max_cost)); }
    if (cuisine) { query += ' AND cuisine = ?'; params.push(cuisine); }
    if (difficulty) { query += ' AND difficulty = ?'; params.push(difficulty); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (dietary) { query += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${dietary}%`, `%${dietary}%`); }
    query += ' ORDER BY title ASC';

    const [recipes] = await db.query(query, params);
    if (!recipes.length) return res.json([]);

    // Fetch ALL ingredients for matched recipes in ONE query
    const recipeIds = recipes.map(r => r.id);
    const [allIngredients] = await db.query(
      `SELECT recipe_id, ingredient_name FROM recipe_ingredients WHERE recipe_id IN (${recipeIds.map(() => '?').join(',')})`,
      recipeIds
    );

    // Group ingredients by recipe_id
    const ingMap = {};
    for (const ing of allIngredients) {
      if (!ingMap[ing.recipe_id]) ingMap[ing.recipe_id] = [];
      ingMap[ing.recipe_id].push(ing.ingredient_name.toLowerCase());
    }

    // Score each recipe
    const scored = recipes.map(recipe => {
      const needed = ingMap[recipe.id] || [];
      const matched = pantryNames.length > 0
        ? needed.filter(n => pantryNames.some(p => p.includes(n) || n.includes(p))).length
        : 0;
      return { ...recipe, match_score: matched, total_ingredients: needed.length };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.match_score - a.match_score);
    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trending = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM recipes WHERE is_trending = TRUE LIMIT 12');
  res.json(rows);
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });

    const [ingredients] = await db.query(
      'SELECT ingredient_name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ? ORDER BY id',
      [req.params.id]
    );
    const [steps] = await db.query(
      'SELECT step_number, instruction FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number',
      [req.params.id]
    );

    res.json({ ...rows[0], ingredients, steps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search / browse all recipes
exports.getAll = async (req, res) => {
  try {
    const { q, cuisine, category, mood } = req.query;
    let query = 'SELECT * FROM recipes WHERE 1=1';
    const params = [];
    if (q) { query += ' AND title LIKE ?'; params.push(`%${q}%`); }
    if (cuisine) { query += ' AND cuisine = ?'; params.push(cuisine); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (mood) { query += ' AND mood_tag = ?'; params.push(mood); }
    query += ' ORDER BY title ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};