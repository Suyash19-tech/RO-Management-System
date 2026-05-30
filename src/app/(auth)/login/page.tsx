"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, ShieldCheck } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Buttons";
import { PhoneInput } from "@/components/ui/Inputs";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleLogin = () => {
    if (phone.length === 10) {
      router.push(`/verify?phone=${phone}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative overflow-hidden">
      {/* Hero Section with Water Visual & Mascot */}
      <div className="relative h-[45%] bg-[#0F4C81] flex flex-col items-center justify-end pb-8 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        {/* Background Water Splash Pattern */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <img 
            src="/assets/water-splash.png" 
            alt="Water Splash" 
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
          <div className="w-24 h-24 mb-4 rounded-full border-4 border-white/20 bg-white shadow-[0_0_30px_rgba(0,184,169,0.3)] p-1 overflow-hidden">
             <img 
              src="/assets/mascot.png" 
              alt="Mascot" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=SR&background=0F4C81&color=fff";
              }}
             />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 drop-shadow-md">
            Welcome Back!
          </h1>
          <p className="text-white/90 text-sm font-medium">
            Your RO. Always Healthy.
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 pt-10 flex flex-col">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
            <p className="text-sm text-slate-500">Enter your mobile number to receive an OTP.</p>
          </div>

          <PhoneInput 
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          />

          <div className="flex items-center gap-2 mt-6 justify-center text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#00B8A9]" />
            <span>Secure OTP Verification</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pb-10"
        >
          <PrimaryButton 
            onClick={handleLogin}
            disabled={phone.length !== 10}
            className="h-14 text-lg shadow-premium active:scale-[0.98]"
          >
            Get OTP
          </PrimaryButton>
          
          <p className="text-center text-[10px] font-semibold text-slate-400 mt-4 px-8 leading-relaxed">
            By continuing, you agree to our <span className="text-[#0F4C81] underline">Terms of Service</span> and <span className="text-[#0F4C81] underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
