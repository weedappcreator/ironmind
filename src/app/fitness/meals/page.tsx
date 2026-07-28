"use client";

import { useEffect, useState, useCallback } from "react";
import { Apple, Plus, Search, X, Utensils } from "lucide-react";

interface Food {
  id: string;
  name: string;
  brand: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  servingSize: number | null;
  servingUnit: string | null;
  imageUrl: string | null;
}

interface MealFood {
  id: string;
  servings: number;
  food: Food;
}

interface Meal {
  id: string;
  name: string | null;
  mealType: string;
  date: string;
  foods: MealFood[];
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState("meal");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<{ food: Food; servings: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMeals(); }, []);

  async function fetchMeals() {
    const res = await fetch("/api/fitness/meals");
    const d = await res.json();
    setMeals(d.meals);
    setTotals(d.dailyTotals);
  }

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/fitness/foods?q=${encodeURIComponent(q)}`);
    const d = await res.json();
    setResults(d.foods);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 400);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  function selectFood(food: Food) {
    setSelectedFoods((prev) => {
      if (prev.find((f) => f.food.id === food.id)) return prev;
      return [...prev, { food, servings: "1" }];
    });
  }

  function removeSelectedFood(id: string) {
    setSelectedFoods((prev) => prev.filter((f) => f.food.id !== id));
  }

  async function saveMeal() {
    if (selectedFoods.length === 0) return;
    const foods = selectedFoods.map((sf) => ({
      foodId: sf.food.id,
      name: sf.food.name,
      calories: sf.food.calories,
      protein: sf.food.protein,
      carbs: sf.food.carbs,
      fat: sf.food.fat,
      servings: parseFloat(sf.servings) || 1,
    }));
    await fetch("/api/fitness/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealType, foods }),
    });
    setShowAdd(false);
    setSearch("");
    setResults([]);
    setSelectedFoods([]);
    fetchMeals();
  }

  function getMealIcon(type: string) {
    switch (type) {
      case "breakfast": return "🌅";
      case "lunch": return "☀️";
      case "dinner": return "🌙";
      default: return "🍿";
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Nutrition</h1>
          <p className="text-zinc-500 text-sm">Track your daily intake</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors">
          <Plus size={16} /> Log Meal
        </button>
      </div>

      {/* Daily Totals */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Calories", value: Math.round(totals.calories), unit: "kcal", color: "text-emerald-400" },
          { label: "Protein", value: Math.round(totals.protein), unit: "g", color: "text-blue-400" },
          { label: "Carbs", value: Math.round(totals.carbs), unit: "g", color: "text-yellow-400" },
          { label: "Fat", value: Math.round(totals.fat), unit: "g", color: "text-red-400" },
        ].map((m) => (
          <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-zinc-600">{m.unit}</p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {mealTypes.map((t) => (
                <button key={t} onClick={() => setMealType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${mealType === t ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}
                >
                  {getMealIcon(t)} {t}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowAdd(false); setSearch(""); setResults([]); setSelectedFoods([]); }} className="text-zinc-500 hover:text-zinc-300">
              <X size={18} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search food (e.g., chicken breast, oats)..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {loading && <p className="text-zinc-600 text-xs text-center py-2">Searching...</p>}

          {results.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 mb-3 border border-zinc-800 rounded-lg p-2">
              {results.map((food) => (
                <button key={food.id} onClick={() => selectFood(food)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                >
                  {food.imageUrl && <img src={food.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-zinc-700" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{food.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {food.calories ? `${Math.round(food.calories)} kcal/100g` : ""}
                      {food.brand ? ` · ${food.brand}` : ""}
                    </p>
                  </div>
                  <Plus size={14} className="text-zinc-500 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {selectedFoods.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs text-zinc-500 font-medium">Selected Foods</p>
              {selectedFoods.map((sf) => (
                <div key={sf.food.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{sf.food.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {sf.food.calories ? `${Math.round(sf.food.calories * parseFloat(sf.servings || "1"))} kcal` : ""}
                    </p>
                  </div>
                  <input type="number" value={sf.servings} onChange={e => setSelectedFoods(prev => prev.map(f => f.food.id === sf.food.id ? { ...f, servings: e.target.value } : f))}
                    className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500/50"
                    placeholder="servings" step="0.5" min="0.25"
                  />
                  <button onClick={() => removeSelectedFood(sf.food.id)} className="text-zinc-600 hover:text-red-400 p-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={saveMeal} disabled={selectedFoods.length === 0}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-black disabled:text-zinc-500 font-medium rounded-lg text-sm transition-colors"
          >
            Log Meal
          </button>
        </div>
      )}

      {/* Today's Meals */}
      {meals.length === 0 && !showAdd ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Apple size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 mb-1">No meals logged today</p>
          <p className="text-zinc-600 text-sm mb-4">Search and log your first meal</p>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors">
            <Plus size={16} /> Log Meal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mealTypes.map((type) => {
            const typeMeals = meals.filter((m) => m.mealType === type);
            if (typeMeals.length === 0) return null;
            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-white mb-2 capitalize flex items-center gap-2">
                  {getMealIcon(type)} {type}
                </h3>
                <div className="space-y-2 mb-4">
                  {typeMeals.map((meal) => (
                    <div key={meal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                      <div className="space-y-1">
                        {meal.foods.map((mf) => (
                          <div key={mf.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {mf.food.imageUrl && <img src={mf.food.imageUrl} alt="" className="w-6 h-6 rounded object-cover bg-zinc-700" />}
                              <span className="text-zinc-300">{mf.food.name}</span>
                              <span className="text-[10px] text-zinc-600">×{mf.servings}</span>
                            </div>
                            <span className="text-zinc-400 text-xs">
                              {mf.food.calories ? `${Math.round(mf.food.calories * mf.servings)} kcal` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}