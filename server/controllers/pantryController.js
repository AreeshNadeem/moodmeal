const db = require('../config/db');

exports.getAll = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM pantry_items WHERE user_id = ? ORDER BY expiry_date ASC',
    [req.user.id]
  );
  res.json(rows);
};

exports.add = async (req, res) => {
  const { name, quantity, unit, expiry_date } = req.body;
  if (quantity <= 0 || quantity > 10000) return res.status(400).json({ error: 'Quantity must be between 0.1 and 10000' });
  const [result] = await db.query(
    'INSERT INTO pantry_items (user_id, name, quantity, unit, expiry_date) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, name, quantity, unit, expiry_date || null]
  );
  res.status(201).json({ id: result.insertId, name, quantity, unit, expiry_date });
};

exports.update = async (req, res) => {
  const { name, quantity, unit, expiry_date } = req.body;
  if (quantity <= 0 || quantity > 10000) return res.status(400).json({ error: 'Quantity must be between 0.1 and 10000' });
  await db.query(
    'UPDATE pantry_items SET name=?, quantity=?, unit=?, expiry_date=? WHERE id=? AND user_id=?',
    [name, quantity, unit, expiry_date, req.params.id, req.user.id]
  );
  res.json({ message: 'Updated' });
};

exports.remove = async (req, res) => {
  await db.query('DELETE FROM pantry_items WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
};

// Items expiring within N days
exports.expiringSoon = async (req, res) => {
  const days = req.query.days || 3;
  const [rows] = await db.query(
    `SELECT * FROM pantry_items 
     WHERE user_id = ? AND expiry_date IS NOT NULL 
     AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY expiry_date ASC`,
    [req.user.id, days]
  );
  res.json(rows);
};
