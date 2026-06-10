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
    
    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-[100dvh] relative overflow-hidden">
      {/* Instant Pure CSS Animated Gradient Background - Sky Blue + White Watery Theme */}
      <motion.div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#e0f2fe] via-[#7dd3fc] to-[#0ea5e9]"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 8,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Decorative Blobs */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/60 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/40 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10 w-full"
      >
        <div className="relative mb-10 flex items-center justify-center">
          {/* Mascot / Logo Image as a Perfect Circle */}
          <div className="w-56 h-56 relative z-10 flex items-center justify-center rounded-full bg-white overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.6)]">
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
            className="text-center px-8 py-5 rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl"
          >
            <h1 className="text-4xl font-black text-[#0F4C81] tracking-tight mb-2 drop-shadow-sm">
              SARDARJI <span className="text-[#00B8A9]">RO</span>
            </h1>
            <p className="text-[#0F4C81] font-bold tracking-widest uppercase text-sm drop-shadow-sm">
              Pure Water. Pure Life.
            </p>
          </motion.div>
        </motion.div>
      </div>
  );
}
