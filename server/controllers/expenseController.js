const db = require('../config/db');

exports.getAll = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC',
    [req.user.id]
  );
  res.json(rows);
};

exports.add = async (req, res) => {
  const { category, amount, description, expense_date } = req.body;
  const [result] = await db.query(
    'INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES (?,?,?,?,?)',
    [req.user.id, category, amount, description, expense_date]
  );
  res.status(201).json({ id: result.insertId, category, amount, description, expense_date });
};

exports.summary = async (req, res) => {
  const [rows] = await db.query(
    `SELECT category, SUM(amount) AS total 
     FROM expenses WHERE user_id = ? 
     AND MONTH(expense_date) = MONTH(CURDATE())
     GROUP BY category`,
    [req.user.id]
  );
  res.json(rows);
};

exports.remove = async (req, res) => {
  await db.query('DELETE FROM expenses WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
};
