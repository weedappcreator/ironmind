import { prisma } from "@/lib/prisma";
import FitnessShell from "./_shell";
import { Dumbbell, Library, Route, TrendingUp, Apple, ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "./_animations";
import "./fitness.css";

export default async function FitnessPage() {
  const [totalExercises, uniqueCategories, uniqueEquipment] = await Promise.all([
    prisma.exercise.count(),
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
      <div className="relative">
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-gradient-to-bl from-emerald-500/10 via-emerald-500/4 to-transparent rounded-full blur-3xl pointer-events-none animate-breathe" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 lg:p-8 max-w-5xl relative">
          <ScrollReveal variant="fade-up" className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-[10px] font-mono tracking-widest uppercase text-emerald-400/80">
                Free Forever
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2 leading-tight">
              Welcome to <br className="sm:hidden" />
              <span className="gradient-text">IronMind</span>
            </h1>
            <p className="text-zinc-500 text-sm max-w-md">Your entire fitness life. No subscriptions, no limits, no ads.</p>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {[
              { icon: Dumbbell, label: "Exercises", value: totalExercises, sub: "with GIF demos", delay: "delay-1" },
              { icon: Library, label: "Categories", value: uniqueCategories.length, sub: "body parts", delay: "delay-2" },
              { icon: Route, label: "Equipment", value: uniqueEquipment.length, sub: "types available", delay: "delay-3" },
              { icon: Apple, label: "Price", value: "Free", sub: "no subscription", delay: "delay-4", accent: true },
            ].map((stat) => (
              <ScrollReveal key={stat.label} variant="scale-in" stagger={parseInt(stat.delay.replace("delay-", "")) * 50} className="h-full">
                <div className={`glass-card rounded-xl p-4 h-full ${stat.delay}`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 border border-emerald-500/10">
                    <stat.icon size={16} className="text-emerald-400" />
                  </div>
                  <p className="text-zinc-500 text-[10px] font-mono tracking-wider uppercase mb-0.5">{stat.label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${stat.accent ? "text-emerald-400" : "text-white"}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-emerald-400/60 mt-1">{stat.sub}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="fade-up">
            <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Quick Start</h2>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-3">
            {[
              { title: "Exercise Library", href: "/fitness/exercises", desc: "Browse 1,324 exercises with GIF demos, filter by body part and equipment", icon: Library, delay: "delay-1" },
              { title: "Workout Tracker", href: "/fitness/workouts", desc: "Log sets, reps, weight, and RPE with a live timer", icon: Dumbbell, delay: "delay-2" },
              { title: "Routine Builder", href: "/fitness/routines", desc: "Create custom workout plans and start them in one tap", icon: Route, delay: "delay-3" },
              { title: "Progress & Meals", href: "/fitness/progress", desc: "Track body stats, nutrition, volume trends, and personal records", icon: TrendingUp, delay: "delay-4" },
            ].map((card) => (
              <ScrollReveal key={card.title} variant="fade-up" stagger={parseInt(card.delay.replace("delay-", "")) * 80}>
                <QuickLinkCard title={card.title} href={card.href} desc={card.desc} icon={card.icon} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="fade-up" className="mt-12">
            <div className="glass-panel rounded-xl p-5 text-center">
              <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase mb-2">Built for lifters, runners, and everyone in between</p>
              <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                IronMind is 100% free — no paywalls, no trial periods, no data selling.
                Train hard, track everything, and never pay a dime.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </FitnessShell>
  );
}

function QuickLinkCard({ title, href, desc, icon: Icon }: { title: string; href: string; desc: string; icon: any }) {
  return (
    <a href={href} className="group glass-card rounded-xl p-5 block">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/8 flex items-center justify-center mb-3 border border-emerald-500/8 group-hover:border-emerald-500/20 transition-all duration-300">
          <Icon size={17} className="text-emerald-400" />
        </div>
        <ArrowRight size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300 mb-1 text-sm">{title}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
    </a>
  );
}