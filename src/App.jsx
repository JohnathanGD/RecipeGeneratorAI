import { useState, useEffect } from "react";
import "./App.css";
import Header from "./Header";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [preferences, setPreferences] = useState("");
  const [recipesData, setRecipesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [culture, setCulture] = useState("");
  const [recipeCount, setRecipeCount] = useState(10);
  const [areas, setAreas] = useState([]);

  async function handleGenerate(e) {
    e.preventDefault();

    if (!ingredients.trim()) {
      alert("Please enter some ingredients first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          preferences,
          culture,
          recipeCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setRecipesData(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchAreas() {
      try {
        const res = await fetch("http://localhost:5050/mealdb/areas");
        const data = await res.json();
        setAreas(data.meals || []);
      } catch (error) {
        console.error("Failed to load MealDB areas:", error);
      }
    }
  
    fetchAreas();
  }, []);

  return (
    <>
      <Header />

      <main className="page">
        <section className="hero">
          <div className="hero-text">
            <span className="badge">AI-Powered Meal Creation</span>
            <h1>Build personalized recipes from what you already have.</h1>
            <p>
              RecipeGenix uses Gemini to analyze your ingredients and generate
              custom recipes based on your preferences, cuisine, and dietary
              goals.
            </p>
            <p className="subtext">
              Enter a grocery list, a few ingredients, a cuisine, or a goal like
              high protein or low carb to get started.
            </p>
          </div>
        </section>

        <section className="app-grid">
          <div className="card">
            <h2>Recipe Inputs</h2>
            <p className="section-text">
              Tell the model what ingredients you have and how you want the meal
              to turn out.
            </p>

            <form onSubmit={handleGenerate} className="form">
              <div className="input-group">
                <label>Ingredients</label>
                <textarea
                  placeholder="Example: chicken, rice, spinach, garlic, onions"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows="5"
                />
              </div>

              <div className="input-group">
                <label>Preferences</label>
                <input
                  type="text"
                  placeholder="Example: high protein, low carb, spicy"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Culture / Cuisine</label>
                <select
                  value={culture}
                  onChange={(e) => setCulture(e.target.value)}
                >
                  <option value="">Any</option>
                  {areas.map((areaObj, index) => (
                    <option key={index} value={areaObj.strArea}>
                      {areaObj.strArea}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Number of Recipes</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={recipeCount}
                  onChange={(e) => setRecipeCount(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="generate-btn">
                {loading ? "Generating..." : "Generate Recipes"}
              </button>
            </form>
          </div>

          <div className="card recipe-card">
            {!recipesData?.recipes ? (
              <div className="empty-state">
                <h2>Your recipes will appear here</h2>
                <p>
                  Once you generate recipes, they will show up here in a cleaner
                  format.
                </p>
              </div>
            ) : (
              <div className="recipe-list">
                {recipesData.recipes.map((item, index) => (
                  <div className="recipe-card-item" key={index}>
                    <span className="recipe-tag">{item.culture}</span>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>

                    <div className="recipe-section">
                      <h3>Ingredients</h3>
                      <ul>
                        {item.ingredients.map((ingredient, i) => (
                          <li key={i}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="recipe-section">
                      <h3>Instructions</h3>
                      <ol>
                        {item.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="recipe-section">
                      <p><strong>Prep Time:</strong> {item.prepTime}</p>
                      <p><strong>Cook Time:</strong> {item.cookTime}</p>
                      <p><strong>Servings:</strong> {item.servings}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default App;