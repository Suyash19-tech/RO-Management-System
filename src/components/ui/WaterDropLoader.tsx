"use client";

import { motion } from "framer-motion";

export function WaterDropLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-12 w-full">
      <div className="relative w-24 h-24 flex items-center justify-center mt-8">
        
        {/* The bouncing, squashing drop parent */}
        <motion.div
          animate={{
            y: [0, -50, 0, 0], 
            scaleY: [1, 1.05, 0.6, 1],
            scaleX: [1, 0.95, 1.3, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            times: [0, 0.4, 0.8, 1],
            ease: ["easeOut", "easeIn", "backOut"],
          }}
          className="relative z-10 flex items-center justify-center origin-bottom"
        >
          {/* The actual teardrop shape (rotated) */}
          <div 
            className="w-12 h-12 bg-gradient-to-br from-[#40E0D0] to-[#4A90E2] shadow-xl shadow-blue-400/40 relative flex items-center justify-center overflow-hidden"
            style={{ 
              borderRadius: "0 50% 50% 50%", 
              transform: "rotate(45deg)" 
            }}
          >
            {/* Highlight/Glass reflection */}
            <div className="absolute top-1 left-2 w-4 h-2 bg-white/40 rounded-full -rotate-45 blur-[1px]" />
            
            {/* Kawaii Face Container (counter-rotated to be upright) */}
            <div 
              style={{ transform: "rotate(-45deg)" }} 
              className="absolute bottom-1 right-1 flex flex-col items-center justify-center w-8 h-8"
            >
              <div className="flex gap-2 relative mt-1">
                {/* Blush */}
                <div className="absolute top-1.5 -left-2 w-2 h-1.5 bg-pink-400 rounded-full opacity-70 blur-[0.5px]" />
                <div className="absolute top-1.5 -right-2 w-2 h-1.5 bg-pink-400 rounded-full opacity-70 blur-[0.5px]" />
                
                {/* Blinking Eyes */}
                <motion.div 
                  animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.05, 0.1, 0.5, 1] }}
                  className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full" 
                />
                <motion.div 
                  animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.05, 0.1, 0.5, 1] }}
                  className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full" 
                />
              </div>
              {/* Cute Mouth */}
              <div className="w-2.5 h-1.5 border-b-[2px] border-[#1E3A8A] rounded-full mt-0.5" />
            </div>
          </div>
        </motion.div>

        {/* The Ripple Effect */}
        <motion.div
          animate={{
            scale: [0.5, 0.5, 2.5],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            times: [0, 0.8, 1],
            ease: ["linear", "easeOut"],
          }}
          className="absolute bottom-0 w-16 h-4 border-[3px] border-[#40E0D0] rounded-[50%]"
        />
        
        {/* Secondary Ripple */}
        <motion.div
          animate={{
            scale: [0.5, 0.5, 1.8],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            times: [0, 0.85, 1],
            ease: ["linear", "easeOut"],
          }}
          className="absolute bottom-0.5 w-12 h-3 border-2 border-blue-400 rounded-[50%]"
        />
      </div>

      {/* Floating text */}
      <motion.p 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-[#4A90E2] font-black tracking-[0.25em] text-[11px] uppercase bg-blue-50/80 px-4 py-1.5 rounded-full shadow-sm"
      >
        Purifying...
      </motion.p>
    </div>
  );
}
