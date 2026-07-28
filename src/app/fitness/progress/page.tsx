"use client";

import { useEffect, useState, useMemo } from "react";
import { Scale, TrendingUp, Dumbbell, Plus, X } from "lucide-react";

interface DayData {
  date: string;
  volume: number;
  name: string;
  exerciseCount: number;
  setCount: number;
}

interface PR {
  exerciseName: string;
  target: string;
  weight: number;
  reps: number;
}

interface Measurement {
  id: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arms: number | null;
  thighs: number | null;
  calves: number | null;
}

export default function ProgressPage() {
  const [volumeData, setVolumeData] = useState<DayData[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [mForm, setMForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/fitness/progress").then(r => r.json()).then(d => { setVolumeData(d.volumeByDate); setPrs(d.prs); });
    fetch("/api/fitness/measurements").then(r => r.json()).then(d => setMeasurements(d.measurements));
  }, []);

  async function addMeasurement() {
    await fetch("/api/fitness/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mForm),
    });
    setShowAdd(false);
    setMForm({});
    const res = await fetch("/api/fitness/measurements");
    const d = await res.json();
    setMeasurements(d.measurements);
  }

  const maxVolume = useMemo(() => Math.max(...volumeData.map(d => d.volume), 1), [volumeData]);

  const weightData = measurements.filter(m => m.weight).map(m => ({ date: m.date.split("T")[0], weight: m.weight! }));

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Progress</h1>
          <p className="text-zinc-500 text-sm">Your gains at a glance</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg text-sm transition-colors">
          <Plus size={16} /> Log Body Stats
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Log Body Measurements</h3>
            <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-zinc-300"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {["weight", "bodyFat", "chest", "waist", "hips", "arms", "thighs", "calves"].map(f => (
              <div key={f}>
                <label className="text-[10px] text-zinc-500 capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input value={mForm[f] || ""} onChange={e => setMForm(p => ({ ...p, [f]: e.target.value }))}
                  placeholder="0" type="number" step="0.1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            ))}
          </div>
          <button onClick={addMeasurement} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-sm font-medium transition-colors">
            Save
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" /> Workout Volume
          </h3>
          {volumeData.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No workouts logged yet</p>
          ) : (
            <div className="relative h-40">
              <div className="absolute inset-0 flex items-end gap-1">
                {volumeData.slice(-14).map((d, i) => {
                  const h = (d.volume / maxVolume) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full bg-emerald-500/20 rounded-t relative" style={{ height: `${Math.max(h, 2)}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {d.volume.toLocaleString()} kg
                        </div>
                      </div>
                      <span className="text-[8px] text-zinc-600">{d.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Scale size={16} className="text-emerald-400" /> Body Weight
          </h3>
          {weightData.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">Log your first measurement</p>
          ) : (
            <div className="relative h-40">
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox={`0 0 ${weightData.length * 40} 160`} preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                    points={weightData.map((d, i) => `${i * 40 + 20},${160 - ((d.weight - Math.min(...weightData.map(w => w.weight))) / (Math.max(...weightData.map(w => w.weight)) - Math.min(...weightData.map(w => w.weight)) || 1)) * 130 - 15}`).join(" ")}
                  />
                  {weightData.map((d, i) => (
                    <circle key={i} cx={i * 40 + 20} cy={160 - ((d.weight - Math.min(...weightData.map(w => w.weight))) / (Math.max(...weightData.map(w => w.weight)) - Math.min(...weightData.map(w => w.weight)) || 1)) * 130 - 15} r="3" fill="#34d399" />
                  ))}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Dumbbell size={16} className="text-emerald-400" /> Personal Records
          </h3>
          {prs.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No PRs yet. Start lifting!</p>
          ) : (
            <div className="space-y-2">
              {prs.map((pr, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
                  <div>
                    <p className="text-sm text-white">{pr.exerciseName}</p>
                    <p className="text-[10px] text-zinc-500 capitalize">{pr.target}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-400 font-semibold">{pr.weight} kg</p>
                    <p className="text-[10px] text-zinc-500">{pr.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Scale size={16} className="text-emerald-400" /> Last Measurements
          </h3>
          {measurements.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No measurements logged</p>
          ) : (
            <div className="space-y-2">
              {measurements.slice(-5).reverse().map((m) => (
                <div key={m.id} className="border-b border-zinc-800/50 last:border-0 pb-2">
                  <p className="text-xs text-zinc-500 mb-1">{new Date(m.date).toLocaleDateString()}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {m.weight && <span className="text-zinc-300">Weight: <span className="text-white">{m.weight}kg</span></span>}
                    {m.bodyFat && <span className="text-zinc-300">BF: <span className="text-white">{m.bodyFat}%</span></span>}
                    {m.chest && <span className="text-zinc-300">Chest: <span className="text-white">{m.chest}cm</span></span>}
                    {m.waist && <span className="text-zinc-300">Waist: <span className="text-white">{m.waist}cm</span></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}