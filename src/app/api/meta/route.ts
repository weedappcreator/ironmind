import { prisma } from "@/lib/prisma";

interface ExerciseCount {
  category: string;
  count: number;
}

export async function GET() {
  const [categories, equipment, totalExercises] = await Promise.all([
    prisma.$queryRawUnsafe<ExerciseCount[]>(
      `SELECT LOWER(TRIM(category)) as category, COUNT(*) as count FROM Exercise WHERE category != '' GROUP BY LOWER(TRIM(category)) ORDER BY count DESC`
    ),
    prisma.$queryRawUnsafe<ExerciseCount[]>(
      `SELECT LOWER(TRIM(equipment)) as category, COUNT(*) as count FROM Exercise WHERE equipment != '' GROUP BY LOWER(TRIM(equipment)) ORDER BY count DESC`
    ),
    prisma.exercise.count(),
  ]);

  return Response.json({ categories, equipment, totalExercises });
}