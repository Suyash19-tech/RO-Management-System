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
      {/* Subtle Water Ripples (CSS Only) */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="w-40 h-40 border-4 border-white rounded-full absolute"
        />
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeOut" }}
          className="w-40 h-40 border-4 border-[#00B8A9] rounded-full absolute"
        />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        {/* Mascot / Logo Image */}
        <div className="w-48 h-48 mb-6 relative drop-shadow-2xl">
          <img 
            src="/assets/mascot.png" 
            alt="Sardarji RO Logo" 
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            onError={(e) => {
              // Fallback if image doesn't exist yet
              e.currentTarget.src = "https://ui-avatars.com/api/?name=Sardarji+RO&background=00B8A9&color=fff&size=200&rounded=true&font-size=0.33";
            }}
          />
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
