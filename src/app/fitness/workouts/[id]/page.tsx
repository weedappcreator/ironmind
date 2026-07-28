import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FitnessShell from "../../_shell";
import Link from "next/link";
import { ArrowLeft, Clock, Dumbbell } from "lucide-react";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!workout) notFound();

  const totalVolume = workout.exercises.reduce(
    (s, e) => s + e.sets.reduce((ss, set) => ss + (set.weight || 0) * (set.reps || 0), 0),
    0
  );
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0);

  return (
    <FitnessShell>
      <div className="p-6 lg:p-8 max-w-4xl">
        <Link href="/fitness/workouts" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to workouts
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">{workout.name || "Workout"}</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>{new Date(workout.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
            {workout.duration && (
              <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor(workout.duration / 60)} min {workout.duration % 60} sec</span>
            )}
            <span>{workout.exercises.length} exercises</span>
            <span>{totalSets} sets</span>
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-emerald-400 font-semibold">{totalVolume.toLocaleString()} kg total volume</span>
          </div>
          {workout.notes && <p className="mt-3 text-zinc-400 text-sm">{workout.notes}</p>}
        </div>

        <div className="space-y-4">
          {workout.exercises.map((we) => (
            <div key={we.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                {we.exercise.gifUrl && (
                  <img
                    src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${we.exercise.gifUrl}`}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                  />
                )}
                <div>
                  <Link href={`/fitness/exercises/${we.exercise.id}`} className="font-medium text-white text-sm hover:text-emerald-400 transition-colors">
                    {we.exercise.name}
                  </Link>
                  <p className="text-[10px] text-zinc-500 capitalize">{we.exercise.target} · {we.exercise.equipment}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                      <th className="p-3 text-left">Set</th>
                      <th className="p-3 text-left">kg</th>
                      <th className="p-3 text-left">Reps</th>
                      <th className="p-3 text-left">RPE</th>
                      <th className="p-3 text-left">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {we.sets.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-zinc-600 text-xs">No sets recorded</td></tr>
                    ) : (
                      we.sets.map((set) => (
                        <tr key={set.id} className="border-b border-zinc-800/50 text-zinc-300">
                          <td className="p-3 text-zinc-400 font-mono text-xs">
                            {set.isWarmup ? "W" : set.isDropset ? "D" : set.setNumber}
                            {set.isFailure && <span className="text-red-400 ml-1">F</span>}
                          </td>
                          <td className="p-3 font-mono">{set.weight ? `${set.weight}` : "-"}</td>
                          <td className="p-3 font-mono">{set.reps ? `${set.reps}` : "-"}</td>
                          <td className="p-3 font-mono text-zinc-500">{set.rpe ? `${set.rpe}` : "-"}</td>
                          <td className="p-3 font-mono text-zinc-500">{set.weight && set.reps ? (set.weight * set.reps).toLocaleString() : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FitnessShell>
  );
}