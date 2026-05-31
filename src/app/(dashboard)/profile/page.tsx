"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, MapPin, Smartphone, Mail, Bell, Moon, Shield, Info, LogOut, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchProfile, UserProfile } from "@/lib/api/profile";
import { cn } from "@/lib/utils";

import { ProfileHeader, SectionCard, ActionRow, ToggleRow } from "@/components/profile/ProfileComponents";
import { WaterDropLoader } from "@/components/ui/WaterDropLoader";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile().then(data => {
      setProfile(data);
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

  if (loading) {
    return <WaterDropLoader />;
  }

  if (!profile) return null;

  return (
    <div className="flex-1 bg-[#F8FAFC] h-full overflow-y-auto pb-20 relative">
      {/* Header Back Button Overlay */}
      <div className="absolute top-2 left-4 z-20">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white/20 bg-white/10 rounded-full transition-colors active:scale-95 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <ProfileHeader user={profile} />

      {/* Floating Info Stats */}
      <div className="px-4 -mt-8 mb-8 relative z-10">
        <div className="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100/80 p-5 flex divide-x divide-slate-100 backdrop-blur-xl">
          <div className="flex-1 text-center">
            <span className="block text-[28px] leading-none font-black text-slate-800">{profile.roSummary.totalUnits}</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5 block">RO Units</span>
          </div>
          <div className="flex-1 text-center flex flex-col items-center justify-center">
            <span className={cn(
              "block text-[14px] font-black px-3 py-1 rounded-full",
              profile.roSummary.amcStatus === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
            )}>
              {profile.roSummary.amcStatus}
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5 block">AMC Status</span>
          </div>
          <div className="flex-1 text-center">
            <span className="block text-[28px] leading-none font-black text-slate-800">{profile.roSummary.totalServices}</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5 block">Services</span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 space-y-6"
      >
        <motion.div variants={item}>
          <SectionCard title="Account Details">
            <ActionRow icon={User} label="Personal Information" value={profile.name} />
            <ActionRow icon={Smartphone} label="Mobile Number" value={profile.phone} />
            <ActionRow icon={Mail} label="Email Address" value={profile.email} />
            <ActionRow icon={MapPin} label="Installation Address" value={profile.addresses.find(a => a.isPrimary)?.address || "123 Default Address"} />
          </SectionCard>
        </motion.div>

        <motion.div variants={item} className="pt-2 pb-6">
          <ActionRow 
            icon={LogOut} 
            label="Logout" 
            hideArrow 
            dangerous 
            onClick={() => router.push("/login")}
          />
        </motion.div>

      </motion.div>
    </div>
  );
}
