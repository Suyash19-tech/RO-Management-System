"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// --- PLACEHOLDER SLIDES ------------------------------------------------------
// Replace these with your actual banner images (800 × 400 px recommended)
const SLIDES = [
  {
    id: 1,
    image: "/slideshow1.png",
    gradient: "from-[#0052D4] via-[#003B9D] to-[#1a1a6e]",
    label: "Sardar Ji RO 1",
    sub: "Premium Water Purification",
    accent: "#00e5ff",
  },
  {
    id: 2,
    image: "/slideshow2.png",
    gradient: "from-[#00B8A9] via-[#008a7e] to-[#005c54]",
    label: "Sardar Ji RO 2",
    sub: "Quality Service Guaranteed",
    accent: "#ffffff",
  },
  {
    id: 3,
    image: "/slideshow3.png",
    gradient: "from-[#7c3aed] via-[#5b21b6] to-[#3b0764]",
    label: "Sardar Ji RO 3",
    sub: "Stay Hydrated, Stay Healthy",
    accent: "#c4b5fd",
  },
];

interface HeroBannerProps {
  slides?: { id: number; image: string | null; gradient: string; label: string; sub: string; accent: string }[];
}

export function HeroBanner({ slides: customSlides }: HeroBannerProps) {
  const items = customSlides ?? SLIDES;
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setCurrent((c) => (c + 1) % items.length);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  // Auto-advance every 3.5 s
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 3500);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragging) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
    setDragging(false);
  };

  const slide = items[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[32px] select-none"
      style={{ height: "200px" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide */}
      {slide.image ? (
        <Image
          src={slide.image}
          alt={slide.label}
          fill
          priority={current === 0}
          className={`object-contain transition-opacity duration-500 ${
            slide.id !== 3 ? "scale-[1.08]" : ""
          }`}
        />
      ) : (
        // Placeholder gradient when no image yet
        <div
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} flex flex-col items-center justify-center gap-2`}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-2 left-4 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative z-10 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 16l4-4 4 4 4-8 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-white font-bold text-[15px]">{slide.label}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{slide.sub}</p>
          </div>
        </div>
      )}

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className="transition-all duration-300"
          >
            <div
              className="rounded-full bg-white transition-all duration-300"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                opacity: i === current ? 1 : 0.4,
              }}
            />
          </button>
        ))}
      </div>

    </div>
  );
}
