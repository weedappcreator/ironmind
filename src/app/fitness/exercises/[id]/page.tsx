import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FitnessShell from "../../_shell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });

  if (!exercise) notFound();

  const secondaryMuscles: string[] = (exercise.secondaryMuscles as string[]) || [];
  const instructions = exercise.instructions.split("\n").filter(Boolean);

  return (
    <FitnessShell>
      <div className="p-6 lg:p-8 max-w-4xl">
        <Link href="/fitness/exercises" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to exercises
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center mb-4">
              {exercise.gifUrl ? (
                <img
                  src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${exercise.gifUrl}`}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-zinc-700 text-6xl font-bold">{exercise.name[0].toUpperCase()}</div>
              )}
            </div>
            {exercise.attribution && (
              <p className="text-[10px] text-zinc-700 text-center">{exercise.attribution}</p>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white capitalize mb-4">{exercise.name}</h1>

            <div className="space-y-3 mb-6">
              <Tag label="Category" value={exercise.category} />
              <Tag label="Target Muscle" value={exercise.target} />
              <Tag label="Muscle Group" value={exercise.muscleGroup} />
              <Tag label="Equipment" value={exercise.equipment} />
              {secondaryMuscles.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Secondary Muscles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {secondaryMuscles.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs capitalize">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Instructions</h2>
              <ol className="space-y-2">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-emerald-400 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </FitnessShell>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-28 shrink-0">{label}</span>
      <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 text-sm capitalize">{value}</span>
    </div>
  );
}