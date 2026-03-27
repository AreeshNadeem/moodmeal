# 🍽️ MoodMeal — Setup Guide

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **AI Chatbot:** Claude API (via Anthropic)

---

## 📁 Folder Structure

```
MoodMeal/
├── client/                  ← React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      ← Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           ← One file per screen
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Pantry.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Trending.jsx
│   │   │   └── Chatbot.jsx
│   │   ├── context/         ← React context (auth, pantry state)
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/           ← Custom hooks
│   │   ├── services/        ← Axios API calls
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                  ← Node.js + Express backend
│   ├── config/
│   │   └── db.js            ← MySQL connection
│   ├── controllers/         ← Business logic
│   │   ├── authController.js
│   │   ├── pantryController.js
│   │   ├── recipeController.js
│   │   ├── expenseController.js
│   │   └── chatController.js
│   ├── routes/              ← Express route definitions
│   │   ├── auth.js
│   │   ├── pantry.js
│   │   ├── recipes.js
│   │   ├── expenses.js
│   │   └── chat.js
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT verification
│   ├── models/              ← SQL query helpers (or ORM)
│   ├── database/
│   │   └── schema.sql       ← All CREATE TABLE statements
│   ├── .env                 ← DB credentials, JWT secret, API keys
│   ├── index.js             ← Entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone / open the folder in VS Code

### 2. Setup the backend
```bash
cd server
npm install
# Copy .env.example to .env and fill in your values
cp .env.example .env
# Import the database schema
mysql -u root -p moodmeal < database/schema.sql
npm run dev
```

### 3. Setup the frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## 🗄️ Database Tables (MySQL)

| Table | Purpose |
|---|---|
| `users` | Auth — email, hashed password |
| `pantry_items` | Ingredients with qty & expiry |
| `recipes` | Recipe catalog |
| `recipe_ingredients` | Many-to-many: recipes ↔ ingredients |
| `expenses` | Grocery & takeaway spending log |
| `chat_history` | Chatbot conversation logs |

---

## 🔑 Environment Variables (server/.env)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=moodmeal
JWT_SECRET=your_jwt_secret_key
PORT=5000
ANTHROPIC_API_KEY=your_key_here
```
