const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET full profile + preferences
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const [prefs] = await db.query(
            'SELECT * FROM user_preferences WHERE user_id = ?',
            [req.user.id]
        );

        res.json({ ...rows[0], preferences: prefs[0] || {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE display name
exports.updateName = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
        await db.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
        res.json({ message: 'Name updated', name: name.trim() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE avatar URL (base64 or external URL)
exports.updateAvatar = async (req, res) => {
    try {
        const { avatar_url } = req.body;
        await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, req.user.id]);
        res.json({ message: 'Avatar updated', avatar_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE password
exports.updatePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        const match = await bcrypt.compare(current_password, rows[0].password_hash);
        if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
        if (new_password.length < 6 || new_password.length > 20) return res.status(400).json({ error: 'New password must be between 6 and 20 characters' });
        const hash = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE preferences (notifications, dietary, budget, currency)
exports.updatePreferences = async (req, res) => {
    try {
        const {
            notifications_expiry,
            notifications_budget,
            notifications_trending,
            dietary_mode,
            weekly_budget,
            currency,
            language,
        } = req.body;

        if (weekly_budget !== null && weekly_budget !== '' && (Number(weekly_budget) < 200 || Number(weekly_budget) > 20000)) {
            return res.status(400).json({ error: 'Weekly budget must be between Rs 200 and Rs 20,000' });
        }

        await db.query(`
      INSERT INTO user_preferences
        (user_id, notifications_expiry, notifications_budget, notifications_trending,
         dietary_mode, weekly_budget, currency, language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        notifications_expiry = VALUES(notifications_expiry),
        notifications_budget = VALUES(notifications_budget),
        notifications_trending = VALUES(notifications_trending),
        dietary_mode = VALUES(dietary_mode),
        weekly_budget = VALUES(weekly_budget),
        currency = VALUES(currency),
        language = VALUES(language)
    `, [
            req.user.id,
            notifications_expiry ?? 1,
            notifications_budget ?? 1,
            notifications_trending ?? 0,
            dietary_mode || 'none',
            weekly_budget || null,
            currency || 'PKR',
            language || 'en',
        ]);

        res.json({ message: 'Preferences saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE account
exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        const match = await bcrypt.compare(password, rows[0].password_hash);
        if (!match) return res.status(400).json({ error: 'Incorrect password' });
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
        res.json({ message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};