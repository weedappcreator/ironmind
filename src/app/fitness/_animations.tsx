"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type AnimationVariant =
  | "fade-up"
  | "fade-in"
  | "scale-in"
  | "slide-right"
  | "slide-left"
  | "zoom-in";

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  variant?: AnimationVariant;
  stagger?: number;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  variant = "fade-up",
  stagger = 0,
}: UseRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const animationClass = isVisible ? `animate-${variant}` : "opacity-0";

  const style = stagger
    ? { animationDelay: `${stagger}ms` }
    : undefined;

  return { ref, isVisible, animationClass, style };
}

const variantMap: Record<AnimationVariant, string> = {
  "fade-up": "animate-fade-up",
  "fade-in": "animate-fade-in",
  "scale-in": "animate-scale-in",
  "slide-right": "animate-slide-right",
  "slide-left": "animate-slide-left",
  "zoom-in": "animate-zoom-in",
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  threshold,
  rootMargin,
  stagger,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  variant?: AnimationVariant;
  threshold?: number;
  rootMargin?: string;
  stagger?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  const { ref, isVisible, style } = useReveal<HTMLDivElement>({
    threshold,
    rootMargin,
    variant,
    stagger,
  });

  const hiddenClass = variant === "fade-in" ? "opacity-0" : "opacity-0 translate-y-4";
  const visibleClass = variantMap[variant];

  return (
    <Tag
      ref={ref}
      className={`${className} ${isVisible ? visibleClass : hiddenClass}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {children}
    </div>
  );
}