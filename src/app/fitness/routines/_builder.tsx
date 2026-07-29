"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, X, Trash2, Dumbbell, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "../_animations";
import "../fitness.css";

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
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Routines</h1>
          <p className="text-zinc-500 text-sm">{routines.length} routines</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-all duration-200 btn-press"
        >
          <Plus size={16} /> New Routine
        </button>
      </div>

      {showCreate && (
        <ScrollReveal variant="fade-up" className="mb-8">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-white">Create Routine</h2>
              <button onClick={() => setShowCreate(false)} className="btn-press p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800/50">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Routine name (e.g. Push Day, Upper Body)"
                className="w-full input-premium"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full input-premium"
              />
            </div>

            <div className="space-y-2 mb-4">
              {exercises.map((ex, i) => (
                <div key={ex.exerciseId + i} className="bg-zinc-800/30 border border-zinc-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ex.exercise.gifUrl && (
                        <div className="w-8 h-8 rounded overflow-hidden bg-zinc-800 shrink-0">
                          <img src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.exercise.gifUrl}`} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white font-display font-semibold">{ex.exercise.name}</p>
                        <p className="text-[10px] text-zinc-500 capitalize">{ex.exercise.target}</p>
                      </div>
                    </div>
                    <button onClick={() => removeExercise(i)} className="btn-press p-1.5 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {[{ key: "sets", label: "Sets" }, { key: "minReps", label: "Min Reps" }, { key: "maxReps", label: "Max Reps" }, { key: "restTime", label: "Rest (s)" }].map((f) => (
                      <div key={f.key} className="flex-1">
                        <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{f.label}</label>
                        <input
                          type={f.key === "sets" ? "number" : "number"}
                          value={(ex as any)[f.key]}
                          onChange={(e) => updateExercise(i, f.key, f.key === "sets" ? (parseInt(e.target.value) || 1) : e.target.value)}
                          className="w-full input-premium-dark text-center text-xs mt-0.5"
                          min={f.key === "sets" ? "1" : undefined}
                          max={f.key === "sets" ? "20" : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {showSearch ? (
              <div className="mb-4">
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exercises to add..."
                  className="w-full input-premium-dark mb-2"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {searchResults.map((ex) => (
                    <button key={ex.id} onClick={() => addToRoutine(ex)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-left"
                    >
                      {ex.gifUrl && <div className="w-8 h-8 rounded overflow-hidden bg-zinc-800 shrink-0"><img src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.gifUrl}`} alt="" className="w-full h-full object-cover" /></div>}
                      <div>
                        <p className="text-sm text-white">{ex.name}</p>
                        <p className="text-[10px] text-zinc-500 capitalize">{ex.target} · {ex.equipment}</p>
                      </div>
                    </button>
                  ))}
                  {search.length >= 2 && searchResults.length === 0 && <p className="text-zinc-600 text-xs text-center py-3">No exercises found</p>}
                </div>
                <button onClick={() => { setShowSearch(false); setSearch(""); }} className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition-colors">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)}
                className="w-full py-2 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-200 text-sm flex items-center justify-center gap-2 mb-4 btn-press"
              >
                <Plus size={14} /> Add Exercise
              </button>
            )}

            <div className="flex gap-3 pt-3 border-t border-zinc-800/50">
              <button onClick={saveRoutine} disabled={saving || !name.trim() || exercises.length === 0}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-black disabled:text-zinc-500 font-medium rounded-lg text-sm transition-all duration-200 btn-press"
              >
                {saving ? "Saving..." : "Save Routine"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-zinc-400 hover:text-zinc-200 text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {!showCreate && routines.length === 0 ? (
        <div className="empty-state">
          <Dumbbell size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 mb-1">No routines yet</p>
          <p className="text-zinc-600 text-sm mb-4">Create your first custom workout plan</p>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-all duration-200 btn-press"
          >
            <Plus size={16} /> Create Routine
          </button>
        </div>
      ) : !showCreate && (
        <div className="space-y-3">
          {routines.map((r) => (
            <div key={r.id} className="group stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-white group-hover:text-emerald-400 transition-colors">{r.name}</h3>
                  {r.description && <p className="text-xs text-zinc-500 mt-0.5">{r.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                    <span>{r.exercises.length} exercises</span>
                    <span>{r.exercises.reduce((s: number, e: any) => s + e.sets, 0)} total sets</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button onClick={() => startRoutine(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition-all duration-200 btn-press"
                  >
                    <Play size={12} /> Start
                  </button>
                  <button onClick={() => deleteRoutine(r.id)} className="btn-press p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {r.exercises.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.exercises.slice(0, 5).map((e: any) => (
                    <span key={e.id} className="tag">
                      {e.exercise.name}
                    </span>
                  ))}
                  {r.exercises.length > 5 && (
                    <span className="tag">
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