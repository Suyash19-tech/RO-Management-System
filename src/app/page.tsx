"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#0F4C81] to-[#0a355c] h-full relative overflow-hidden">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10 w-full"
      >
        <div className="relative mb-10 flex items-center justify-center">
          {/* Subtle Water Ripples (Oscillating Waves) */}
          <div className="absolute flex items-center justify-center pointer-events-none z-0">
            {[0, 1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeOut",
                  delay: i * 0.75 
                }}
                className="w-56 h-56 border-2 border-white/40 rounded-full absolute"
              />
            ))}
          </div>

          {/* Mascot / Logo Image as a Perfect Circle */}
          <div className="w-56 h-56 relative z-10 flex items-center justify-center rounded-full bg-white overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            <img 
              src="/Sardarji_RO_logo.png" 
              alt="Sardarji RO Logo" 
              className="w-[115%] h-[115%] object-cover"
            />
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
            SARDARJI <span className="text-[#00B8A9]">RO</span>
          </h1>
          <p className="text-white/80 font-medium tracking-widest uppercase text-sm">
            Pure Water. Pure Life.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
