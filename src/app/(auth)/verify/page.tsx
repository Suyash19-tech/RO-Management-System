"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Buttons";
import { OTPInput } from "@/components/ui/Inputs";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "9876543210";
  
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = () => {
    if (otp.length === 6) {
      // In real app, call verification API, then redirect to Dashboard
      router.push("/home");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Header */}
      <div className="pt-6 pb-2 px-4 flex items-center">
        <button 
          onClick={() => router.back()}
          className="p-3 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          <div className="w-16 h-16 bg-[#00B8A9]/10 text-[#00B8A9] rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Verify Mobile
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Please enter the 6-digit OTP sent to <br/>
            <span className="font-semibold text-slate-800">+91 {phone}</span>
          </p>

          <OTPInput 
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />

          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-sm text-slate-500">
              Didn't receive code?
            </p>
            {timer > 0 ? (
              <span className="text-sm font-medium text-slate-400">
                Resend in {timer}s
              </span>
            ) : (
              <button className="text-sm font-bold text-[#0F4C81] hover:underline active:opacity-70">
                Resend OTP
              </button>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-6"
        >
          <PrimaryButton 
            onClick={handleVerify}
            disabled={otp.length !== 6}
          >
            Verify & Proceed
          </PrimaryButton>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyScreen() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col bg-white h-full items-center justify-center p-6 text-slate-500 font-semibold">
        Loading verification...
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
