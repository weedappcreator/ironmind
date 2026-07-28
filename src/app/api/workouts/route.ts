import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "cms57a3qv0000zlc2udbdd4m3";

export async function GET() {
  const workouts = await prisma.workout.findMany({
    where: { userId: DEMO_USER_ID },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, gifUrl: true, category: true } },
          sets: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  const summary = workouts.map((w) => ({
    id: w.id,
    name: w.name,
    date: w.date,
    duration: w.duration,
    notes: w.notes,
    exerciseCount: w.exercises.length,
    totalSets: w.exercises.reduce((s, e) => s + e.sets.length, 0),
    totalVolume: w.exercises.reduce((s, e) => s + e.sets.reduce((ss, set) => ss + (set.weight || 0) * (set.reps || 0), 0), 0),
  }));

  return NextResponse.json({ workouts: summary });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, notes, exercises } = body;

  const workout = await prisma.workout.create({
    data: {
      userId: DEMO_USER_ID,
      name: name || null,
      notes: notes || null,
      exercises: {
        create: (exercises || []).map((ex: { exerciseId: string; order: number; sets: { reps?: number; weight?: number; setNumber: number }[] }, i: number) => ({
          exerciseId: ex.exerciseId,
          order: ex.order ?? i,
          sets: {
            create: (ex.sets || []).map((s: { reps?: number; weight?: number; setNumber: number }) => ({
              setNumber: s.setNumber,
              reps: s.reps || null,
              weight: s.weight || null,
            })),
          },
        })),
      },
    },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, gifUrl: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json({ workout });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.workout.delete({ where: { id } });
  return NextResponse.json({ success: true });
}