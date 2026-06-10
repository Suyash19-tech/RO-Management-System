"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, User, MapPin } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Buttons";
import { PhoneInput, TextInput, TextAreaInput } from "@/components/ui/Inputs";
import Script from "next/script";

const Typewriter = ({ texts, delay = 2500 }: { texts: string[], delay?: number }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = texts[currentTextIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }, 30); // fast delete
    } else {
      if (currentText === fullText) {
        timeout = setTimeout(() => setIsDeleting(true), delay); // wait before delete
      } else {
        timeout = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, 80); // type speed
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, delay]);

  return (
    <span>
      {currentText}
      <span className="animate-pulse ml-0.5 opacity-70">|</span>
    </span>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
            color: 0x4a79b3,
            waveHeight: 15.50,
            waveSpeed: 1.10
          });
          setVantaEffect(vantaEffectInstance);
        }
      } catch (err) {
        console.error("Vanta failed to load:", err);
      }
    };

    const checkVanta = setInterval(() => {
      if ((window as any).VANTA) {
        initVanta();
        clearInterval(checkVanta);
      }
    }, 100);
    
    return () => {
      clearInterval(checkVanta);
      if (vantaEffectInstance) vantaEffectInstance.destroy();
    };
  }, []);

  const handleLogin = async () => {
    if (phone.length === 10) {
      setLoading(true);
      setError("");
      try {
        // We call the admin portal API to verify if the customer exists
        // In local development, Admin Portal runs on 3000. 
        const res = await fetch(`/admin-api/customers/${phone}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Your account has not been activated. Please contact the administrator or wait until your installation is complete.");
          } else {
            setError("Something went wrong. Please try again.");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        
        // Save customer details to local storage so the customer portal can use it
        localStorage.setItem("customer_profile", JSON.stringify(data));
        
        router.push(`/home`);
      } catch (err) {
        setError("Could not connect to the server. Please ensure the Admin portal is running.");
        setLoading(false);
      }
    }
  };

  const isFormValid = phone.length === 10 && !loading;

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="lazyOnload" />
      <div className="flex-1 flex flex-col bg-slate-50 h-full relative overflow-y-auto">
        {/* Hero Section with Water Visual & Mascot */}
        <div ref={vantaRef} className="relative h-64 bg-[#0F4C81] flex flex-col items-center justify-end pb-8 rounded-b-[2.5rem] shadow-xl overflow-hidden shrink-0">

        
        {/* Glassmorphic overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81] via-transparent to-transparent opacity-90" />

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center flex flex-col items-center px-6"
        >
          <div className="w-20 h-20 mb-3 rounded-full border-4 border-white/20 bg-white shadow-[0_0_30px_rgba(0,184,169,0.3)] p-1 overflow-hidden">
             <img 
              src="/Sardarji_RO_logo.png" 
              alt="Mascot" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=SR&background=0F4C81&color=fff";
              }}
             />
          </div>
          <div className="bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center justify-center">
            <h1 className="text-xl font-black text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight h-8 flex items-center justify-center">
              <Typewriter texts={["Welcome to SardarJi RO..", "Sat Sri Akal Ji.."]} />
            </h1>
            <p className="text-white font-bold text-[10px] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Your Health Our Priority
            </p>
          </div>
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 pt-8 pb-10 flex flex-col">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 space-y-5"
        >
          <div className="mb-2 text-center">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Login to your account</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Enter your registered mobile number</p>
          </div>

          <div className="space-y-4">
            {/* Phone Number (Unique Key) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Mobile Number</label>
              <PhoneInput 
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setError("");
                }}
                className={`bg-white shadow-sm focus:ring-2 focus:ring-[#00B8A9]/20 ${error ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'}`}
              />
              {error && (
                <p className="text-xs font-bold text-rose-600 mt-2 ml-1 animate-in slide-in-from-top-1">{error}</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <PrimaryButton 
            onClick={handleLogin}
            disabled={!isFormValid}
            className="h-14 text-lg shadow-premium active:scale-[0.98] w-full flex items-center justify-center gap-2 group"
          >
            {loading ? "Verifying Account..." : "Login"}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </PrimaryButton>
          
          <p className="text-center text-[10px] font-semibold text-slate-400 mt-5 px-8 leading-relaxed">
            By continuing, you agree to our <span className="text-[#0F4C81] underline">Terms of Service</span> and <span className="text-[#0F4C81] underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
