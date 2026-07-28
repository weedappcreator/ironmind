"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Check, Timer, X, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  equipment: string;
  target: string;
  gifUrl: string | null;
}

interface SetData {
  id?: string;
  setNumber: number;
  reps: string;
  weight: string;
  rpe: string;
  isWarmup: boolean;
  isDropset: boolean;
  isFailure: boolean;
}

interface WorkoutExercise {
  id?: string;
  exerciseId: string;
  order: number;
  exercise: Exercise;
  sets: SetData[];
}

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get("id");

  const [workout, setWorkout] = useState<{ id: string; name: string | null } | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  useEffect(() => {
    if (!workoutId) return;
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, workoutId]);

  useEffect(() => {
    if (!workoutId) return;
    fetch(`/api/fitness/workouts/${workoutId}`)
      .then((r) => r.json())
      .then((data) => {
        setWorkout(data.workout);
        setExercises(
          data.workout.exercises.map((e: WorkoutExercise) => ({
            ...e,
            sets: e.sets.length > 0 ? e.sets : [{ setNumber: 1, reps: "", weight: "", rpe: "", isWarmup: false, isDropset: false, isFailure: false }],
          }))
        );
      });
  }, [workoutId]);

  const searchExercises = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await fetch(`/api/fitness/exercises?search=${encodeURIComponent(q)}&limit=10`);
    const data = await res.json();
    setSearchResults(data.exercises);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchExercises(search), 300);
    return () => clearTimeout(timer);
  }, [search, searchExercises]);

  function addExercise(exercise: Exercise) {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        order: prev.length,
        exercise,
        sets: [{ setNumber: 1, reps: "", weight: "", rpe: "", isWarmup: false, isDropset: false, isFailure: false }],
      },
    ]);
    setShowSearch(false);
    setSearch("");
  }

  function addSet(exIndex: number) {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [
        ...ex.sets,
        {
          setNumber: ex.sets.length + 1,
          reps: lastSet?.reps || "",
          weight: lastSet?.weight || "",
          rpe: "",
          isWarmup: false,
          isDropset: false,
          isFailure: false,
        },
      ];
      updated[exIndex] = ex;
      return updated;
    });
  }

  function updateSet(exIndex: number, setIndex: number, field: keyof SetData, value: string | boolean) {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      ex.sets = sets;
      updated[exIndex] = ex;
      return updated;
    });
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function finishWorkout() {
    setSaving(true);
    const payload = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      order: ex.order,
      sets: ex.sets
        .filter((s) => s.reps || s.weight)
        .map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
          rpe: s.rpe ? parseFloat(s.rpe) : null,
          isWarmup: s.isWarmup,
          isDropset: s.isDropset,
          isFailure: s.isFailure,
        })),
    }));

    // Save each exercise with sets
    for (const ex of payload) {
      if (ex.sets.length === 0) continue;
      await fetch(`/api/fitness/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: ex.exerciseId, sets: ex.sets }),
      });
    }

    // Update duration
    await fetch(`/api/fitness/workouts/${workoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration }),
    });

    setSaving(false);
    router.push(`/fitness/workouts/${workoutId}`);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/fitness/workouts")} className="text-zinc-500 hover:text-zinc-200">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{workout?.name || "Active Workout"}</h1>
            <p className="text-zinc-500 text-sm">{formatTime(duration)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTimerRunning(!timerRunning)} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200">
            {timerRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={finishWorkout} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-black disabled:text-zinc-500 font-medium rounded-lg text-sm transition-colors">
            {saving ? "Saving..." : "Finish"}
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {exercises.map((ex, exIndex) => (
          <div key={ex.exerciseId + exIndex} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                {ex.exercise.gifUrl && (
                  <img
                    src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.exercise.gifUrl}`}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                  />
                )}
                <div>
                  <h3 className="font-medium text-white text-sm">{ex.exercise.name}</h3>
                  <p className="text-[10px] text-zinc-500 capitalize">{ex.exercise.target} · {ex.exercise.equipment}</p>
                </div>
              </div>
              <button onClick={() => removeExercise(exIndex)} className="p-1.5 text-zinc-600 hover:text-red-400">
                <X size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="p-3 text-left w-12">Set</th>
                    <th className="p-3 text-left w-24">Previous</th>
                    <th className="p-3 text-left w-20">kg</th>
                    <th className="p-3 text-left w-20">Reps</th>
                    <th className="p-3 text-left w-16">RPE</th>
                    <th className="p-3 text-left w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((set, setIndex) => (
                    <tr key={setIndex} className={cn("border-b border-zinc-800/50", set.isWarmup && "opacity-60")}>
                      <td className="p-3 text-zinc-400 font-mono text-xs">
                        {set.isWarmup ? "W" : set.isDropset ? "D" : setIndex + 1}
                      </td>
                      <td className="p-3 text-zinc-600 text-xs font-mono">-</td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(exIndex, setIndex, "weight", e.target.value)}
                          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-emerald-500/50"
                          placeholder="0"
                          step="0.5"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exIndex, setIndex, "reps", e.target.value)}
                          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-emerald-500/50"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={set.rpe}
                          onChange={(e) => updateSet(exIndex, setIndex, "rpe", e.target.value)}
                          className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-emerald-500/50"
                          placeholder="RPE"
                          step="0.5"
                          min="1"
                          max="10"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateSet(exIndex, setIndex, "isWarmup", !set.isWarmup)}
                            className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors", set.isWarmup ? "bg-blue-500/20 text-blue-400" : "text-zinc-600")}
                          >
                            W
                          </button>
                          <button
                            onClick={() => updateSet(exIndex, setIndex, "isFailure", !set.isFailure)}
                            className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors", set.isFailure ? "bg-red-500/20 text-red-400" : "text-zinc-600")}
                          >
                            F
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-zinc-800">
              <button onClick={() => addSet(exIndex)} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
                <Plus size={14} /> Add set
              </button>
            </div>
          </div>
        ))}
      </div>

      {showSearch ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 mb-3"
            autoFocus
          />
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {searchResults.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addExercise(ex)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
              >
                {ex.gifUrl && (
                  <img src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.gifUrl}`} alt="" className="w-8 h-8 rounded object-cover bg-zinc-800" />
                )}
                <div>
                  <p className="text-sm text-white">{ex.name}</p>
                  <p className="text-[10px] text-zinc-500 capitalize">{ex.target} · {ex.equipment}</p>
                </div>
              </button>
            ))}
            {search.length >= 2 && searchResults.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-4">No exercises found</p>
            )}
          </div>
          <button onClick={() => { setShowSearch(false); setSearch(""); }} className="mt-3 text-xs text-zinc-500 hover:text-zinc-300">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Exercise
        </button>
      )}
    </div>
  );
}