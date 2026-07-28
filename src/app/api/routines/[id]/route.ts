import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await prisma.routine.findUnique({
    where: { id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!routine) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ routine });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.routine.delete({ where: { id } });
  return NextResponse.json({ success: true });
}