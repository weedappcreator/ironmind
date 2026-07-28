import { prisma } from "@/lib/prisma";
import FitnessShell from "../_shell";
import ExerciseGrid from "./_grid";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoryParam = typeof params.category === "string" ? params.category : "";
  const equipmentParam = typeof params.equipment === "string" ? params.equipment : "";
  const targetParam = typeof params.target === "string" ? params.target : "";
  const searchParam = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const limit = 48;

  const where: Record<string, unknown> = {};
  if (categoryParam) where.category = categoryParam.toLowerCase();
  if (equipmentParam) where.equipment = equipmentParam.toLowerCase();
  if (targetParam) where.target = targetParam.toLowerCase();
  if (searchParam) {
    const s = searchParam.toLowerCase();
    where.OR = [
      { name: { contains: s } },
      { target: { contains: s } },
      { muscleGroup: { contains: s } },
    ];
  }

  const [exercises, total, categories, equipment] = await Promise.all([
    prisma.exercise.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.exercise.findMany({
      select: { equipment: true },
      distinct: ["equipment"],
      orderBy: { equipment: "asc" },
    }),
  ]);

  return (
    <FitnessShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Exercise Library</h1>
          <p className="text-zinc-500 text-sm">{total} exercises with GIF demonstrations</p>
        </div>

        <ExerciseGrid
          exercises={exercises.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category,
            equipment: e.equipment,
            target: e.target,
            image: e.image,
            gifUrl: e.gifUrl,
          }))}
          categories={categories.map((c) => c.category).filter(Boolean)}
          equipment={equipment.map((e) => e.equipment).filter(Boolean)}
          selectedCategory={categoryParam}
          selectedEquipment={equipmentParam}
          search={searchParam}
          page={page}
          totalPages={Math.ceil(total / limit)}
        />
      </div>
    </FitnessShell>
  );
}