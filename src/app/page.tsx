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
      {/* Instant Pure CSS Animated Gradient Background */}
      <motion.div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a2463] via-[#0F4C81] to-[#3e92cc]"
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
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
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
          className="text-center px-8 py-5 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl"
        >
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
            SARDARJI <span className="text-[#00B8A9] drop-shadow-[0_2px_8px_rgba(0,184,169,0.5)]">RO</span>
          </h1>
          <p className="text-white font-bold tracking-widest uppercase text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Pure Water. Pure Life.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
