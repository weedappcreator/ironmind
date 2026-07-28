import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const equipment = searchParams.get("equipment");
  const target = searchParams.get("target");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const where: Record<string, unknown> = {};

  if (category) where.category = category.toLowerCase();
  if (equipment) where.equipment = equipment.toLowerCase();
  if (target) where.target = target.toLowerCase();
  if (search) {
    where.OR = [
      { name: { contains: search.toLowerCase() } },
      { target: { contains: search.toLowerCase() } },
      { muscleGroup: { contains: search.toLowerCase() } },
    ];
  }

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.exercise.count({ where }),
  ]);

  return NextResponse.json({ exercises, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ids } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  const exercises = await prisma.exercise.findMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ exercises });
}