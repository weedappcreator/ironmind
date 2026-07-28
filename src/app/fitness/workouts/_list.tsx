"use client";

import { useEffect, useState } from "react";
import { Plus, Clock, Dumbbell, ArrowRight, Trash2, Activity } from "lucide-react";
import Link from "next/link";

interface WorkoutSummary {
  id: string;
  name: string | null;
  date: string;
  duration: number | null;
  notes: string | null;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
}

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [workoutName, setWorkoutName] = useState("");

  useEffect(() => { fetchWorkouts(); }, []);

  async function fetchWorkouts() {
    const res = await fetch("/api/fitness/workouts");
    const data = await res.json();
    setWorkouts(data.workouts);
    setLoading(false);
  }

  async function startWorkout() {
    const res = await fetch("/api/fitness/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: workoutName || `Workout ${new Date().toLocaleDateString()}`, exercises: [] }),
    });
    const data = await res.json();
    window.location.href = `/fitness/workouts/active?id=${data.workout.id}`;
  }

  async function deleteWorkout(id: string) {
    if (!confirm("Delete this workout?")) return;
    await fetch(`/api/fitness/workouts?id=${id}`, { method: "DELETE" });
    fetchWorkouts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Workouts</h1>
          <p className="text-zinc-500 text-sm">{workouts.length} total workouts</p>
        </div>
        <button
          onClick={() => setShowStart(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          Start Workout
        </button>
      </div>

      {showStart && (
        <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex gap-3">
          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Workout name (optional)"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && startWorkout()}
          />
          <button onClick={startWorkout} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-sm font-medium transition-colors">
            Go
          </button>
          <button onClick={() => setShowStart(false)} className="px-3 py-2 text-zinc-400 hover:text-zinc-200 text-sm">
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading workouts...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Activity size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 mb-1">No workouts yet</p>
          <p className="text-zinc-600 text-sm mb-4">Start your first workout to begin tracking</p>
          <button onClick={() => setShowStart(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors">
            <Plus size={16} /> Start Workout
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <div key={w.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <Link href={`/fitness/workouts/${w.id}`} className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {w.name || "Workout"}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                    <span>{new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                    {w.duration && <span className="flex items-center gap-1"><Clock size={12} /> {Math.floor(w.duration / 60)}m</span>}
                    <span>{w.exerciseCount} exercises</span>
                    <span>{w.totalSets} sets</span>
                    {w.totalVolume > 0 && <span>{w.totalVolume.toLocaleString()} kg total</span>}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => deleteWorkout(w.id)} className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                  <Link href={`/fitness/workouts/${w.id}`} className="p-2 text-zinc-500 hover:text-zinc-200">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}