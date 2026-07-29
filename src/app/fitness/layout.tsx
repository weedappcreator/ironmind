import { Inter, JetBrains_Mono, Barlow_Condensed } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IronMind — Free Fitness Tracker",
  description: "Your entire fitness life. Free forever.",
};

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable}`}>
      {children}
    </div>
  );
}