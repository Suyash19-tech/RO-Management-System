"use client";
import { motion } from "framer-motion";

export function FloatingBubbles() {
  // We repurpose this file to be the smooth animated blue background shades.
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      
      {/* Top Left Blob */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[50%] bg-[#dbeafe] rounded-full blur-[100px] opacity-60"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Bottom Right Blob */}
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[70%] md:w-[50%] h-[60%] bg-[#bfdbfe] rounded-full blur-[120px] opacity-50"
        animate={{
          x: [0, -60, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Center Soft Blob */}
      <motion.div
        className="absolute top-[30%] left-[20%] w-[50%] h-[40%] bg-[#e0f2fe] rounded-full blur-[90px] opacity-40"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

    </div>
  );
}
