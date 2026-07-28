import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "cms57a3qv0000zlc2udbdd4m3";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meals = await prisma.meal.findMany({
    where: {
      userId: DEMO_USER_ID,
      date: { gte: today, lt: tomorrow },
    },
    include: {
      foods: {
        include: { food: true },
      },
    },
    orderBy: { date: "asc" },
  });

  const dailyTotals = meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((mf) => {
        const cals = (mf.food.calories || 0) * mf.servings;
        acc.calories += cals;
        acc.protein += (mf.food.protein || 0) * mf.servings;
        acc.carbs += (mf.food.carbs || 0) * mf.servings;
        acc.fat += (mf.food.fat || 0) * mf.servings;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return NextResponse.json({ meals, dailyTotals });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, mealType, foods } = body;

  const meal = await prisma.meal.create({
    data: {
      userId: DEMO_USER_ID,
      name: name || null,
      mealType: mealType || "snack",
      foods: {
        create: await Promise.all(
          (foods || []).map(async (f: { foodId: string; name: string; calories?: number; protein?: number; carbs?: number; fat?: number; servings: number }) => {
            await prisma.foodItem.upsert({
              where: { barcode: f.foodId },
              update: { name: f.name },
              create: {
                id: f.foodId,
                name: f.name,
                barcode: f.foodId,
                calories: f.calories || null,
                protein: f.protein || null,
                carbs: f.carbs || null,
                fat: f.fat || null,
              },
            });
            return {
              foodId: f.foodId,
              servings: f.servings || 1,
            };
          })
        ),
      },
    },
    include: {
      foods: { include: { food: true } },
    },
  });

  return NextResponse.json({ meal });
}