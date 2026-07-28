import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workout) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ workout });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const { name, notes, duration, date } = body;

  const workout = await prisma.workout.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(notes !== undefined && { notes }),
      ...(duration !== undefined && { duration }),
      ...(date !== undefined && { date: new Date(date) }),
    },
  });

  return NextResponse.json({ workout });
}