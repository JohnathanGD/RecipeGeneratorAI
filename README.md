# RecipeGenix 🍽️

RecipeGenix is an AI-powered recipe generation platform that creates personalized recipes based on user-provided ingredients, preferences, and cuisine selection. The application integrates Google Gemini for intelligent generation and TheMealDB for contextual inspiration, forming a retrieval-augmented generation (RAG) pipeline.

---

## 🚀 Features

- Generate up to 10 unique recipes from user inputs
- Upload grocery lists (image, PDF, or text) → auto-extract ingredients using Gemini
- Culture-based recipe generation (e.g., Italian, Mexican, Japanese)
- Retrieval-Augmented Generation (MealDB + Gemini)
- Interactive recipe carousel (navigate like Instagram posts)
- Expandable recipe details (show more / show less)
- Clean, responsive UI built with React + Vite

---

## 🧠 How It Works

The system follows a hybrid AI pipeline:

User Input (ingredients / file upload)
        ↓
Gemini (ingredient extraction)
        ↓
MealDB (recipe inspiration retrieval)
        ↓
Gemini (final recipe generation)
        ↓
Frontend display (carousel UI)

This architecture improves realism, diversity, and contextual relevance of generated recipes.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- CSS (custom styling)
- Fetch API

### Backend
- Node.js + Express
- Google Gemini API (@google/genai)
- Multer (file uploads)

### APIs
- Google Gemini (AI generation + file understanding)
- TheMealDB (recipe inspiration / cultural context)

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/RecipeGenix.git
cd RecipeGenix
```

### 2. Install dependencies

#### Frontend
```bash
cd client
npm install
npm run dev
```

#### Backend
```bash
cd server
npm install
node index.js
```

---

## 🔑 Environment Variables

Create a `.env` file in `/server`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5050
```

⚠️ Do NOT commit your API key.

---

## 📡 API Endpoints

### AI Generation
POST /generate-hybrid

### Ingredient Extraction
POST /extract-ingredients

### MealDB Integration
GET /mealdb/areas
GET /mealdb/by-area
GET /mealdb/by-ingredient
GET /mealdb/lookup

---

## 📂 Project Structure

RecipeGenix/
├── client/        # React frontend
│   ├── src/
│   └── App.jsx
│
├── server/        # Express backend
│   ├── index.js
│   └── .env
│
└── README.md

---

## 🎯 Key Highlights

- Implements a real-world **RAG (Retrieval-Augmented Generation)** system
- Combines structured AI output with external data sources
- Uses multimodal AI (file upload → ingredient extraction)
- Focuses on usability with an intuitive UI/UX

---

## 🔮 Future Improvements

- Drag-and-drop file uploads
- Nutrition analysis integration
- Save/favorite recipes
- User accounts
- Mobile swipe gestures for recipe navigation
- AI meal planning (weekly plans)

---

## 🧪 Example Use Case

1. Upload a grocery list image
2. Ingredients auto-fill
3. Select "Italian" cuisine
4. Generate recipes
5. Browse through results using carousel navigation

---

## 📸 Demo (Optional)

_Add screenshots or a demo video here_

---

## 👨‍💻 Author

Johnathan Gutierrez-Diaz  
Florida State University  
Computer Science + Biology + Finance  

---

## 📄 License

MIT License