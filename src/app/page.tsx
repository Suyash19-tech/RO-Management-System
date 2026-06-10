"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Script from "next/script";

export default function SplashScreen() {
  const router = useRouter();
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(0);

  useEffect(() => {
    let vantaEffectInstance: any = null;
    const initVanta = () => {
      try {
        if (!vantaEffectInstance && vantaRef.current && (window as any).VANTA) {
          vantaEffectInstance = (window as any).VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x24a1e6, // Sky blue
            shininess: 60.00, // Make it look like shiny water
            waveHeight: 18.00,
            waveSpeed: 1.20,
            zoom: 0.8
          });
          setVantaEffect(vantaEffectInstance);
        }
      } catch (err) {
        console.error("Vanta failed to load:", err);
      }
    };

    // Retry initialization if scripts haven't loaded yet
    const checkVanta = setInterval(() => {
      if ((window as any).VANTA) {
        initVanta();
        clearInterval(checkVanta);
      }
    }, 100);

    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500);
    
    return () => {
      clearInterval(checkVanta);
      clearTimeout(timer);
      if (vantaEffectInstance) vantaEffectInstance.destroy();
    };
  }, [router]);

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="afterInteractive" />
      
      {/* Container with a fallback CSS gradient so it looks good instantly while Vanta loads */}
      <div ref={vantaRef} className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#80c8f5] via-[#48abeb] to-[#0F4C81] h-[100dvh] relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center z-10 w-full"
        >
          <div className="relative mb-10 flex items-center justify-center">
            {/* Mascot / Logo Image as a Perfect Circle */}
            <div className="w-56 h-56 relative z-10 flex items-center justify-center rounded-full bg-white overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.4)]">
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
    </>
  );
}
