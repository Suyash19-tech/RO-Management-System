"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchDashboardData, DashboardData } from "@/lib/api/dashboard";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";

// Compute greeting synchronously — no useEffect needed
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Good Morning", emoji: "🌅" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening", emoji: "🌇" };
  return { text: "Good Night", emoji: "🌙" };
}

// Read from localStorage synchronously — zero loading flash
function getDashboardFromCache(): DashboardData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("customer_profile");
    if (!stored || stored === "null" || stored === "undefined") return null;
    const parsed = JSON.parse(stored);
    if (!parsed) return null;

    const amc = parsed.amcs?.find((a: any) => a.status === 'ACTIVE');
    return {
      user: { name: parsed.name, phone: parsed.phone },
      roScore: 90,
      nextService: parsed.appointments?.find((a: any) => a.status !== 'COMPLETED')?.date || "No upcoming service",
      activeAMC: !!amc,
      amcDetails: amc ? {
        planName: amc.plan,
        expiryDate: amc.endDate,
        daysRemaining: Math.ceil((new Date(amc.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      } : undefined,
      notifications: [{ id: "1", title: "Welcome to Sardarji RO", body: "Your profile is set up and active.", read: false, createdAt: parsed.createdAt }],
      recentTickets: parsed.appointments?.slice(0, 3).map((apt: any) => ({ id: apt.id, issueType: apt.type, status: apt.status, createdAt: apt.date })) || [],
    };
  } catch { return null; }
}

export default function DashboardHome() {
  const greeting = getGreeting();
  const [data, setData] = useState<DashboardData | null>(() => getDashboardFromCache());

  // Background refresh — silently updates without any spinner
  useEffect(() => {
    let mounted = true;
    fetchDashboardData().then((res) => {
      if (res && mounted) setData(res);
    });
    return () => { mounted = false; };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

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
          <span className="text-[#0052cc]">
            {data?.user?.name?.split(' ')[0] || ""}
          </span>
          <motion.span 
            className="inline-block text-3xl select-none"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {greeting.emoji}
          </motion.span>
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B8A9] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B8A9]"></span>
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
