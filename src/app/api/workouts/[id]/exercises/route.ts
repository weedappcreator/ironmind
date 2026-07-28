import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { exerciseId, sets } = body;

  const existing = await prisma.workoutExercise.findFirst({
    where: { workoutId: id, exerciseId },
  });

  let workoutExercise;
  if (existing) {
    await prisma.set.deleteMany({ where: { workoutExerciseId: existing.id } });
    workoutExercise = existing;
  } else {
    const count = await prisma.workoutExercise.count({ where: { workoutId: id } });
    workoutExercise = await prisma.workoutExercise.create({
      data: { workoutId: id, exerciseId, order: count },
    });
  }

  if (sets && sets.length > 0) {
    await prisma.set.createMany({
      data: sets.map((s: { setNumber: number; reps?: number; weight?: number; rpe?: number; isWarmup?: boolean; isDropset?: boolean; isFailure?: boolean }) => ({
        workoutExerciseId: workoutExercise.id,
        setNumber: s.setNumber,
        reps: s.reps || null,
        weight: s.weight || null,
        rpe: s.rpe || null,
        isWarmup: s.isWarmup || false,
        isDropset: s.isDropset || false,
        isFailure: s.isFailure || false,
      })),
    });
  }

  return NextResponse.json({ workoutExercise });
}