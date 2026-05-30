"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchDashboardData, DashboardData } from "@/lib/api/dashboard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
          <div className="w-full h-full bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Page Header Area - Pushed up and compact */}
      <div className="mb-4 -mt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          Good Morning, Suyash <span className="text-3xl">😊</span>
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">Stay hydrated, Stay healthy</p>
      </div>

      {/* Top Hero Row */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 w-full">
        <div className="w-full">
          <ScoreCard score={data!.roScore} />
        </div>
      </div>

      {/* Quick Links Row - Cute squares */}
      <div className="w-full">
        <QuickActionGrid />
      </div>

    </div>
  );
}
