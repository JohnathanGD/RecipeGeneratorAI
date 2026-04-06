import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          culture: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          prepTime: { type: Type.STRING },
          cookTime: { type: Type.STRING },
          servings: { type: Type.INTEGER },
        },
        required: [
          "title",
          "culture",
          "description",
          "ingredients",
          "instructions",
          "prepTime",
          "cookTime",
          "servings",
        ],
      },
    },
  },
  required: ["recipes"],
};

app.post("/generate-recipe", async (req, res) => {
    try {
      const { ingredients, preferences, culture, recipeCount } = req.body;
  
      if (!ingredients?.trim()) {
        return res.status(400).json({
          error: "Ingredients are required.",
        });
      }
  
      const count = Math.min(Math.max(Number(recipeCount) || 10, 1), 10);
  
        const firstIngredient = ingredients
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean)[0];

        let mealdbResults = [];

        if (culture) {
        const areaRes = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(culture)}`
        );
        const areaData = await areaRes.json();
        mealdbResults = areaData.meals || [];
        } else if (firstIngredient) {
        const ingredientRes = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(firstIngredient)}`
        );
        const ingredientData = await ingredientRes.json();
        mealdbResults = ingredientData.meals || [];
        }

        const mealNames = mealdbResults
        .slice(0, 10)
        .map((meal) => meal.strMeal)
        .filter(Boolean);
  

      const prompt = `
      You are an expert recipe generator.

      The user wants recipes based on:
      Ingredients: ${ingredients}
      Preferences: ${preferences || "None"}
      Culture: ${culture || "Any"}
      
      Important:
      - Not all provided ingredients must be used in every recipe
      - Use only the ingredients that make sense for each recipe
      - It is okay to leave out ingredients that do not fit well
      - Prefer the user's ingredients when possible
      - You may add a few common pantry items if needed
      
      Here are relevant meal inspirations from TheMealDB:
      ${mealNames.length ? mealNames.join(", ") : "No inspirations found"}
      
      Generate exactly ${count} distinct recipe options.
      Make the recipes practical, realistic, and meaningfully different from one another.
      Use the MealDB inspirations only as style/context, not as exact copies.
      Return structured recipe data only.
        `;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: recipeSchema,
        },
      });
  
      const parsed = JSON.parse(response.text);
  
      res.json(parsed);
    } catch (error) {
      console.error("Hybrid generation error:", error);
      res.status(500).json({
        error: error?.message || "Failed to generate recipes",
      });
    }
  });

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/mealdb/areas", async (req, res) => {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MealDB areas error:", error);
      res.status(500).json({ error: "Failed to fetch MealDB areas" });
    }
  });
  
  app.get("/mealdb/ingredients", async (req, res) => {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MealDB ingredients error:", error);
      res.status(500).json({ error: "Failed to fetch MealDB ingredients" });
    }
  });
  
  app.get("/mealdb/by-area", async (req, res) => {
    try {
      const { area } = req.query;
  
      if (!area) {
        return res.status(400).json({ error: "Area is required" });
      }
  
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MealDB by-area error:", error);
      res.status(500).json({ error: "Failed to fetch meals by area" });
    }
  });
  
  app.get("/mealdb/by-ingredient", async (req, res) => {
    try {
      const { ingredient } = req.query;
  
      if (!ingredient) {
        return res.status(400).json({ error: "Ingredient is required" });
      }
  
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MealDB by-ingredient error:", error);
      res.status(500).json({ error: "Failed to fetch meals by ingredient" });
    }
  });
  
  app.get("/mealdb/lookup", async (req, res) => {
    try {
      const { id } = req.query;
  
      if (!id) {
        return res.status(400).json({ error: "Meal id is required" });
      }
  
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MealDB lookup error:", error);
      res.status(500).json({ error: "Failed to fetch meal details" });
    }
  });

  app.post("/mealdb/inspiration", async (req, res) => {
    try {
      const { ingredients, culture } = req.body;
  
      const firstIngredient = ingredients
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean)[0];
  
      let mealdbResults = [];
  
      if (culture) {
        const areaRes = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(culture)}`
        );
        const areaData = await areaRes.json();
        mealdbResults = areaData.meals || [];
      } else if (firstIngredient) {
        const ingredientRes = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(firstIngredient)}`
        );
        const ingredientData = await ingredientRes.json();
        mealdbResults = ingredientData.meals || [];
      }
  
      res.json({
        source: "MealDB",
        primaryIngredient: firstIngredient || null,
        culture: culture || null,
        meals: mealdbResults.slice(0, 10),
      });
    } catch (error) {
      console.error("MealDB inspiration error:", error);
      res.status(500).json({ error: "Failed to fetch MealDB inspiration" });
    }
  });

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});