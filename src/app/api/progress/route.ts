import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "cms57a3qv0000zlc2udbdd4m3";

export async function GET() {
  const workouts = await prisma.workout.findMany({
    where: { userId: DEMO_USER_ID },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
    orderBy: { date: "asc" },
  });

  const volumeByDate = workouts.map((w) => {
    const volume = w.exercises.reduce(
      (s, e) => s + e.sets.reduce((ss, set) => ss + (set.weight || 0) * (set.reps || 0), 0),
      0
    );
    return {
      date: w.date.toISOString().split("T")[0],
      volume,
      name: w.name || "Workout",
      exerciseCount: w.exercises.length,
      setCount: w.exercises.reduce((s, e) => s + e.sets.length, 0),
    };
  });

  const prs = await getPersonalRecords();

  return NextResponse.json({ volumeByDate, prs });
}

async function getPersonalRecords() {
  const allSets = await prisma.set.findMany({
    include: {
      workoutExercise: {
        include: { exercise: { select: { id: true, name: true, target: true } } },
      },
    },
    orderBy: { weight: "desc" },
  });

  const bestByExercise = new Map<string, { weight: number; reps: number; date: string }>();
  for (const set of allSets) {
    const exId = set.workoutExercise.exerciseId;
    const weight = set.weight || 0;
    if (!bestByExercise.has(exId) || weight > (bestByExercise.get(exId)?.weight || 0)) {
      bestByExercise.set(exId, {
        weight,
        reps: set.reps || 0,
        date: "",
      });
    }
  }

  return Array.from(bestByExercise.entries())
    .filter(([_, v]) => v.weight > 0)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 10)
    .map(([id, data]) => ({
      exerciseId: id,
      exerciseName: allSets.find((s) => s.workoutExercise.exerciseId === id)?.workoutExercise.exercise.name || "",
      target: allSets.find((s) => s.workoutExercise.exerciseId === id)?.workoutExercise.exercise.target || "",
      weight: data.weight,
      reps: data.reps,
    }));
}