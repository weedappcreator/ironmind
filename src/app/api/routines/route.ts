import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "cms57a3qv0000zlc2udbdd4m3";

export async function GET() {
  const routines = await prisma.routine.findMany({
    where: { userId: DEMO_USER_ID },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, gifUrl: true, category: true, target: true, equipment: true } },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ routines });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, exercises } = body;

  const routine = await prisma.routine.create({
    data: {
      userId: DEMO_USER_ID,
      name,
      description: description || null,
      exercises: {
        create: (exercises || []).map((ex: { exerciseId: string; sets: number; minReps?: number; maxReps?: number; restTime?: number }, i: number) => ({
          exerciseId: ex.exerciseId,
          order: i,
          sets: ex.sets || 3,
          minReps: ex.minReps || null,
          maxReps: ex.maxReps || null,
          restTime: ex.restTime || null,
        })),
      },
    },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, gifUrl: true, category: true, target: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json({ routine });
}