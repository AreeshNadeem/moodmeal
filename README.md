# MoodMeal

Moodmeal is a website application that tackles both the daily confusion of what to cook and the problem of food wastage. The application provides features such as mood based recipe recommendations, pantry management, expense tracking and an AI-powered chatbot that can answer user queries.


## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **AI Chatbot:** 


---

## How to Run the Project:

### 1. Open the folder in VS Code

### 2. Setup the backend
```bash
cd server
npm install
# copy .env.example to .env and fill in your values
cp .env.example .env
# import the database schema
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

## Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=moodmeal
JWT_SECRET=your_jwt_secret_key
PORT=5000

YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
```
