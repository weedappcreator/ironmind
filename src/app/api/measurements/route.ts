import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "cms57a3qv0000zlc2udbdd4m3";

export async function GET() {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ measurements });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { weight, bodyFat, chest, waist, hips, arms, thighs, calves } = body;

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId: DEMO_USER_ID,
      weight: weight ? parseFloat(weight) : null,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      chest: chest ? parseFloat(chest) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      arms: arms ? parseFloat(arms) : null,
      thighs: thighs ? parseFloat(thighs) : null,
      calves: calves ? parseFloat(calves) : null,
    },
  });

  return NextResponse.json({ measurement });
}