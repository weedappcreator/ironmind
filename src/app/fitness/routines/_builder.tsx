"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, X, GripVertical, Trash2, Dumbbell, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  target: string;
  equipment: string;
  category: string;
  gifUrl: string | null;
}

interface RoutineEx {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  minReps: string;
  maxReps: string;
  restTime: string;
}

export default function RoutineBuilder() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [routines, setRoutines] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [exercises, setExercises] = useState<RoutineEx[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRoutines(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await fetch(`/api/fitness/exercises?search=${encodeURIComponent(q)}&limit=10`);
    const data = await res.json();
    setSearchResults(data.exercises);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 300);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  async function fetchRoutines() {
    const res = await fetch("/api/fitness/routines");
    const data = await res.json();
    setRoutines(data.routines);
  }

  function addToRoutine(exercise: Exercise) {
    setExercises((prev) => [...prev, {
      exerciseId: exercise.id, exercise,
      sets: 3, minReps: "", maxReps: "", restTime: "",
    }]);
    setShowSearch(false);
    setSearch("");
  }

  function updateExercise(index: number, field: string, value: any) {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveRoutine() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name,
      description,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        minReps: ex.minReps ? parseInt(ex.minReps) : null,
        maxReps: ex.maxReps ? parseInt(ex.maxReps) : null,
        restTime: ex.restTime ? parseInt(ex.restTime) : null,
      })),
    };
    const res = await fetch("/api/fitness/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    setShowCreate(false);
    setName("");
    setDescription("");
    setExercises([]);
    fetchRoutines();
  }

  async function deleteRoutine(id: string) {
    if (!confirm("Delete this routine?")) return;
    await fetch(`/api/fitness/routines/${id}`, { method: "DELETE" });
    fetchRoutines();
  }

  async function startRoutine(id: string) {
    const res = await fetch(`/api/fitness/routines/${id}`);
    const data = await res.json();
    const routine = data.routine;

    const workoutRes = await fetch("/api/fitness/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: routine.name,
        notes: routine.description,
        exercises: routine.exercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          sets: Array.from({ length: ex.sets }, (_, i) => ({ setNumber: i + 1 })),
        })),
      }),
    });
    const workoutData = await workoutRes.json();
    router.push(`/fitness/workouts/active?id=${workoutData.workout.id}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Routines</h1>
          <p className="text-zinc-500 text-sm">{routines.length} routines</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> New Routine
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create Routine</h2>
            <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-zinc-300">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Routine name (e.g. Push Day, Upper Body)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-2 mb-4">
            {exercises.map((ex, i) => (
              <div key={ex.exerciseId + i} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {ex.exercise.gifUrl && (
                      <img src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.exercise.gifUrl}`} alt="" className="w-8 h-8 rounded object-cover bg-zinc-700" />
                    )}
                    <div>
                      <p className="text-sm text-white">{ex.exercise.name}</p>
                      <p className="text-[10px] text-zinc-500 capitalize">{ex.exercise.target}</p>
                    </div>
                  </div>
                  <button onClick={() => removeExercise(i)} className="p-1 text-zinc-600 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-500">Sets</label>
                    <input type="number" value={ex.sets} onChange={(e) => updateExercise(i, "sets", parseInt(e.target.value) || 1)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500/50"
                      min="1" max="20"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-500">Min Reps</label>
                    <input type="number" value={ex.minReps} onChange={(e) => updateExercise(i, "minReps", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-500">Max Reps</label>
                    <input type="number" value={ex.maxReps} onChange={(e) => updateExercise(i, "maxReps", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-500">Rest (s)</label>
                    <input type="number" value={ex.restTime} onChange={(e) => updateExercise(i, "restTime", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showSearch ? (
            <div className="mb-4">
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercises to add..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 mb-2"
                autoFocus
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {searchResults.map((ex) => (
                  <button key={ex.id} onClick={() => addToRoutine(ex)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                  >
                    {ex.gifUrl && <img src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.gifUrl}`} alt="" className="w-8 h-8 rounded object-cover bg-zinc-700" />}
                    <div>
                      <p className="text-sm text-white">{ex.name}</p>
                      <p className="text-[10px] text-zinc-500 capitalize">{ex.target} · {ex.equipment}</p>
                    </div>
                  </button>
                ))}
                {search.length >= 2 && searchResults.length === 0 && <p className="text-zinc-600 text-xs text-center py-3">No exercises found</p>}
              </div>
              <button onClick={() => { setShowSearch(false); setSearch(""); }} className="text-xs text-zinc-500 hover:text-zinc-300 mt-2">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)}
              className="w-full py-2 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors text-sm flex items-center justify-center gap-2 mb-4"
            >
              <Plus size={14} /> Add Exercise
            </button>
          )}

          <div className="flex gap-3 pt-3 border-t border-zinc-800">
            <button onClick={saveRoutine} disabled={saving || !name.trim() || exercises.length === 0}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-black disabled:text-zinc-500 font-medium rounded-lg text-sm transition-colors"
            >
              {saving ? "Saving..." : "Save Routine"}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-zinc-400 hover:text-zinc-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {!showCreate && routines.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Dumbbell size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 mb-1">No routines yet</p>
          <p className="text-zinc-600 text-sm mb-4">Create your first custom workout plan</p>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors"
          >
            <Plus size={16} /> Create Routine
          </button>
        </div>
      ) : !showCreate && (
        <div className="space-y-3">
          {routines.map((r) => (
            <div key={r.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{r.name}</h3>
                  {r.description && <p className="text-xs text-zinc-500 mt-0.5">{r.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                    <span>{r.exercises.length} exercises</span>
                    <span>{r.exercises.reduce((s: number, e: any) => s + e.sets, 0)} total sets</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startRoutine(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition-colors"
                  >
                    <Play size={12} /> Start
                  </button>
                  <button onClick={() => deleteRoutine(r.id)} className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {r.exercises.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.exercises.slice(0, 5).map((e: any) => (
                    <span key={e.id} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {e.exercise.name}
                    </span>
                  ))}
                  {r.exercises.length > 5 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                      +{r.exercises.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}