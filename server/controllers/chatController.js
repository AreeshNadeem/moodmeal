const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Get pantry context
    const [pantry] = await db.query(
      'SELECT name, quantity, unit FROM pantry_items WHERE user_id = ?', [userId]
    );
    const pantryList = pantry.map(p => `${p.name} (${p.quantity} ${p.unit || ''})`).join(', ');

    // Get last 10 messages for context
    const [history] = await db.query(
      'SELECT role, message FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    // Gemini uses 'user' and 'model' (not 'assistant')
    const historyFormatted = history.reverse().map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.message }],
    }));

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `You are Remy, MoodMeal's friendly AI cooking assistant.
Help users with recipes, cooking tips, ingredient substitutions, and meal planning.
The user's current pantry contains: ${pantryList || 'nothing listed yet'}.
Be concise, friendly, and practical. If the pantry is empty, suggest common ingredients.`,
    });

    const chat = model.startChat({ history: historyFormatted });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Save both messages
    await db.query(
      'INSERT INTO chat_history (user_id, role, message) VALUES (?,?,?),(?,?,?)',
      [userId, 'user', message, userId, 'assistant', reply]
    );

    res.json({ reply });
  } catch (err) {
    console.error('CHAT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  const [rows] = await db.query(
    'SELECT role, message, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT 50',
    [req.user.id]
  );
  res.json(rows);
};