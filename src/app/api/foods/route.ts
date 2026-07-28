import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const barcode = searchParams.get("barcode");

  if (barcode) {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: { "User-Agent": "IronMind - FreeFitnessTracker - v1.0" },
    });
    const data = await res.json();
    if (data.status === 1) {
      const p = data.product;
      return NextResponse.json({
        foods: [{
          id: barcode,
          name: p.product_name || "Unknown",
          brand: p.brands || null,
          calories: p.nutriments?.["energy-kcal_100g"] || null,
          protein: p.nutriments?.proteins_100g || null,
          carbs: p.nutriments?.carbohydrates_100g || null,
          fat: p.nutriments?.fat_100g || null,
          fiber: p.nutriments?.fiber_100g || null,
          sugar: p.nutriments?.sugars_100g || null,
          sodium: p.nutriments?.sodium_100g || null,
          servingSize: 100,
          servingUnit: "g",
          imageUrl: p.image_url || null,
          category: p.categories_tags?.[0]?.replace("en:", "") || null,
        }],
      });
    }
    return NextResponse.json({ foods: [] });
  }

  if (!query || query.length < 2) return NextResponse.json({ foods: [] });

  const res = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=15&json=true`,
    { headers: { "User-Agent": "IronMind - FreeFitnessTracker - v1.0" } }
  );
  const data = await res.json();
  const products = data.products || [];

  const foods = products.map((p: any) => ({
    id: p.code || p.id,
    name: p.product_name || "Unknown",
    brand: p.brands || null,
    calories: p.nutriments?.["energy-kcal_100g"] || null,
    protein: p.nutriments?.proteins_100g || null,
    carbs: p.nutriments?.carbohydrates_100g || null,
    fat: p.nutriments?.fat_100g || null,
    fiber: p.nutriments?.fiber_100g || null,
    sugar: p.nutriments?.sugars_100g || null,
    sodium: p.nutriments?.sodium_100g || null,
    servingSize: 100,
    servingUnit: "g",
    imageUrl: p.image_url || null,
    category: p.categories_tags?.[0]?.replace("en:", "") || null,
  }));

  return NextResponse.json({ foods });
}