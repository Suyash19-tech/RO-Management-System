"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, User, MapPin } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Buttons";
import { PhoneInput, TextInput, TextAreaInput } from "@/components/ui/Inputs";

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
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleLogin = () => {
    if (phone.length === 10 && name.trim().length > 0) {
      // Store user details in localStorage or simulated backend (for now just route to home)
      router.push(`/home`);
    }
  };

  const isFormValid = phone.length === 10 && name.trim().length > 0 && address.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full relative overflow-y-auto">
      {/* Hero Section with Water Visual & Mascot */}
      <div className="relative h-64 bg-[#0F4C81] flex flex-col items-center justify-end pb-8 rounded-b-[2.5rem] shadow-xl overflow-hidden shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <img 
            src="/login.png" 
            alt="Login Banner" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=1000&auto=format&fit=crop";
            }}
          />
        </div>
        
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
          <h1 className="text-2xl font-black text-white mb-1 drop-shadow-md tracking-tight h-8 flex items-center justify-center">
            <Typewriter texts={["Welcome to SardarJi RO..", "Sat Sri Akal Ji.."]} />
          </h1>
          <p className="text-white/80 text-xs font-semibold tracking-wider uppercase">
            Your Health Our Priority
          </p>
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Set up your profile</h2>
          </div>

          <div className="space-y-4">
            {/* Phone Number (Unique Key) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Mobile Number</label>
              <PhoneInput 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="bg-white shadow-sm border-slate-200 focus:ring-2 focus:ring-[#00B8A9]/20"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0F4C81]" />
                Full Name
              </label>
              <TextInput 
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white shadow-sm border-slate-200 focus:ring-2 focus:ring-[#0F4C81]/20"
              />
            </div>

            {/* Installation Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00B8A9]" />
                Installation Address
              </label>
              <TextAreaInput 
                placeholder="Enter complete address for RO installation and service"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="bg-white shadow-sm border-slate-200 focus:ring-2 focus:ring-[#00B8A9]/20"
              />
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
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </PrimaryButton>
          
          <p className="text-center text-[10px] font-semibold text-slate-400 mt-5 px-8 leading-relaxed">
            By continuing, you agree to our <span className="text-[#0F4C81] underline">Terms of Service</span> and <span className="text-[#0F4C81] underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
