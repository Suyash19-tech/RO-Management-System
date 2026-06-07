"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchDashboardData, DashboardData } from "@/lib/api/dashboard";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";
import { WaterDropLoader } from "@/components/ui/WaterDropLoader";

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState({ text: "Good Morning", emoji: "🌅" });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({ text: "Good Morning", emoji: "🌅" });
    } else if (hour >= 12 && hour < 17) {
      setGreeting({ text: "Good Afternoon", emoji: "☀️" });
    } else if (hour >= 17 && hour < 21) {
      setGreeting({ text: "Good Evening", emoji: "🌇" });
    } else {
      setGreeting({ text: "Good Night", emoji: "🌙" });
    }

    fetchDashboardData().then((res) => {
      // Try to inject user from localStorage
      let user = undefined;
      try {
        const stored = localStorage.getItem("customer_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          user = { name: parsed.name, phone: parsed.phone };
        }
      } catch(e) {}
      
      setData({ ...res, user });
      setLoading(false);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

  const getGreetingTheme = () => {
    // Elegant, highly-refined brand colors matching the Sardar Ji RO corporate theme
    return {
      nameColor: "text-[#0052cc]",
      accentBg: "bg-slate-50",
      indicatorColor: "bg-[#00B8A9]"
    };
  };

  const theme = getGreetingTheme();

  if (loading) {
    return <WaterDropLoader />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 w-full"
    >
      {/* Greeting */}
      <motion.div variants={item} className="pt-5 pb-1 flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center flex-wrap gap-x-2 gap-y-1">
          <span>{greeting.text},</span>
          <span className={theme.nameColor}>
            {data?.user?.name?.split(' ')[0] || "Suyash"}
          </span>
          <motion.span 
            className="inline-block text-3xl select-none"
            animate={{ 
              y: [0, -3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut" 
            }}
          >
            {greeting.emoji}
          </motion.span>
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.indicatorColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.indicatorColor}`}></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Stay Hydrated • Stay Healthy
          </span>
        </div>
      </motion.div>

      {/* Hero Slideshow Banner */}
      <motion.div variants={item}>
        <HeroBanner />
      </motion.div>

      {/* Quick Action Grid */}
      <motion.div variants={item}>
        <QuickActionGrid />
      </motion.div>

    </motion.div>
  );
}
