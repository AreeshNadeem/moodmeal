require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pantry', require('./routes/pantry'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/youtube', require('./routes/Youtube'));
app.use('/api/saves', require('./routes/saves'));
app.use('/api/settings', require('./routes/Settings'));

// Health check
app.get('/api/health', (req, res) => res.json({ message: '🍽️ MoodMeal API running' }));

// For production (Vercel)
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

