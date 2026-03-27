const db = require('../config/db');

// Get all saved recipes for user (with search)
exports.getSaved = async (req, res) => {
    try {
        const { q } = req.query;
        let query = `
      SELECT r.*, sr.saved_at
      FROM recipes r
      INNER JOIN saved_recipes sr ON r.id = sr.recipe_id
      WHERE sr.user_id = ?
    `;
        const params = [req.user.id];
        if (q) {
            query += ` AND (r.title LIKE ? OR r.description LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
        query += ` ORDER BY sr.saved_at DESC`;
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Save a recipe
exports.save = async (req, res) => {
    try {
        const { recipe_id } = req.body;
        await db.query(
            'INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)',
            [req.user.id, recipe_id]
        );
        res.status(201).json({ saved: true, recipe_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Unsave a recipe
exports.unsave = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
            [req.user.id, req.params.recipe_id]
        );
        res.json({ saved: false, recipe_id: req.params.recipe_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all saved recipe IDs for the user (for heart state on recommendations page)
exports.getSavedIds = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT recipe_id FROM saved_recipes WHERE user_id = ?',
            [req.user.id]
        );
        res.json(rows.map(r => r.recipe_id));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};