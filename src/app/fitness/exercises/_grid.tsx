"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  image: string | null;
  gifUrl: string | null;
}

export default function ExerciseGrid({
  exercises,
  categories,
  equipment,
  selectedCategory,
  selectedEquipment,
  search,
  page,
  totalPages,
}: {
  exercises: Exercise[];
  categories: string[];
  equipment: string[];
  selectedCategory: string;
  selectedEquipment: string;
  search: string;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (params.category || selectedCategory) sp.set("category", params.category ?? selectedCategory);
    if (params.equipment || selectedEquipment) sp.set("equipment", params.equipment ?? selectedEquipment);
    if (params.search || search) sp.set("search", params.search ?? search);
    if (params.page) sp.set("page", params.page);
    return `/fitness/exercises?${sp.toString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/fitness/exercises?search=${encodeURIComponent(searchInput)}`);
  };

  const toggleFilter = (key: string, value: string) => {
    const sp = new URLSearchParams();
    if (key === "category") {
      if (value !== selectedCategory) sp.set("category", value);
      if (selectedEquipment) sp.set("equipment", selectedEquipment);
    } else {
      if (value !== selectedEquipment) sp.set("equipment", value);
      if (selectedCategory) sp.set("category", selectedCategory);
    }
    if (search) sp.set("search", search);
    router.push(`/fitness/exercises?${sp.toString()}`);
  };

  const clearFilters = () => router.push("/fitness/exercises");

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm border transition-colors",
            showFilters || selectedCategory || selectedEquipment
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          )}
        >
          Filters {(selectedCategory || selectedEquipment) ? "(active)" : ""}
        </button>
        {(selectedCategory || selectedEquipment || search) && (
          <button onClick={clearFilters} className="px-4 py-2.5 rounded-lg text-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid lg:grid-cols-2 gap-4 mb-6 p-5 glass-panel rounded-xl">
          <div>
            <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-wider">Body Part</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleFilter("category", c)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs transition-all duration-200",
                    selectedCategory === c
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/5"
                      : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:text-zinc-200 hover:bg-zinc-800"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-wider">Equipment</p>
            <div className="flex flex-wrap gap-1.5">
              {equipment.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleFilter("equipment", e)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs transition-all duration-200",
                    selectedEquipment === e
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/5"
                      : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:text-zinc-200 hover:bg-zinc-800"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {exercises.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500">No exercises found</p>
          <button onClick={clearFilters} className="mt-2 text-emerald-400 text-sm hover:underline">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {exercises.map((ex, i) => (
              <Link
                key={ex.id}
                href={`/fitness/exercises/${ex.id}`}
                className="group glass-card rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/8 animate-fade-up"
                style={{ animationDelay: `${(i % 16) * 30}ms` }}
              >
                <div className="aspect-square bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                  {ex.gifUrl ? (
                    <img
                      src={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.gifUrl}`}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-zinc-700 text-4xl font-bold">{ex.name[0].toUpperCase()}</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                      {ex.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                      {ex.equipment}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors",
                    p === page
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}