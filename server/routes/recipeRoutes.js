import express from "express";
import db from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/saved-recipes", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const {
    title,
    culture,
    description,
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
    evaluation,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Recipe title is required." });
  }

  const sql = `
    INSERT INTO saved_recipes (
      user_id,
      title,
      culture,
      description,
      ingredients,
      instructions,
      prep_time,
      cook_time,
      servings,
      overall_score,
      dietary_fit,
      allergy_safety,
      ingredient_fit,
      preference_fit,
      practicality,
      revision_notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId,
    title,
    culture || "",
    description || "",
    JSON.stringify(ingredients || []),
    JSON.stringify(instructions || []),
    prepTime || "",
    cookTime || "",
    servings || null,
    evaluation?.overallScore ?? null,
    evaluation?.dietaryFit ?? null,
    evaluation?.allergySafety ?? null,
    evaluation?.ingredientFit ?? null,
    evaluation?.preferenceFit ?? null,
    evaluation?.practicality ?? null,
    evaluation?.revisionNotes ?? null,
  ];

  db.run(sql, values, function (err) {
    if (err) {
      console.error("Error saving recipe:", err.message);
      return res.status(500).json({ error: "Failed to save recipe." });
    }

    res.status(201).json({
      message: "Recipe saved successfully.",
      recipeId: this.lastID,
    });
  });
});

router.get("/saved-recipes", authenticateToken, (req, res) => {
  db.all(
    `SELECT * FROM saved_recipes WHERE user_id = ? ORDER BY id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("Error fetching saved recipes:", err.message);
        return res.status(500).json({ error: "Failed to fetch saved recipes." });
      }

      const recipes = rows.map((recipe) => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients || "[]"),
        instructions: JSON.parse(recipe.instructions || "[]"),
        evaluation: {
          overallScore: recipe.overall_score,
          dietaryFit: recipe.dietary_fit,
          allergySafety: recipe.allergy_safety,
          ingredientFit: recipe.ingredient_fit,
          preferenceFit: recipe.preference_fit,
          practicality: recipe.practicality,
          revisionNotes: recipe.revision_notes,
        },
      }));

      res.json(recipes);
    }
  );
});

export default router;