"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, MapPin, Smartphone, Mail, Bell, Moon, Shield, Info, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchProfile, UserProfile } from "@/lib/api/profile";

import { ProfileHeader, SectionCard, ActionRow, ToggleRow } from "@/components/profile/ProfileComponents";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Toggle state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [darkEnabled, setDarkEnabled] = useState(false);

  useEffect(() => {
    fetchProfile().then(data => {
      setProfile(data);
      setPushEnabled(data.settings.pushNotifications);
      setWhatsappEnabled(data.settings.whatsappNotifications);
      setDarkEnabled(data.settings.darkMode);
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
    return <div className="p-6">Loading profile...</div>;
  }

  if (!profile) return null;

  return (
    <div className="flex-1 bg-[#F8FAFC] h-full overflow-y-auto pb-20 relative">
      {/* Header Back Button Overlay */}
      <div className="absolute top-6 left-4 z-20">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white/20 bg-white/10 rounded-full transition-colors active:scale-95 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <ProfileHeader user={profile} />

      {/* Floating Info Stats */}
      <div className="px-6 -mt-6 mb-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 flex divide-x divide-slate-100">
          <div className="flex-1 text-center">
            <span className="block text-2xl font-black text-[#0F4C81]">{profile.roSummary.totalUnits}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RO Units</span>
          </div>
          <div className="flex-1 text-center">
            <span className={`block text-xl font-black mt-1 ${profile.roSummary.amcStatus === 'ACTIVE' ? 'text-[#00B8A9]' : 'text-red-500'}`}>
              {profile.roSummary.amcStatus}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">AMC Status</span>
          </div>
          <div className="flex-1 text-center">
            <span className="block text-2xl font-black text-[#0F4C81]">{profile.roSummary.totalServices}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-6 space-y-5"
      >
        <motion.div variants={item}>
          <SectionCard title="Account Details">
            <ActionRow icon={User} label="Personal Information" value={profile.name} />
            <ActionRow icon={Smartphone} label="Mobile Number" value={profile.phone} />
            <ActionRow icon={Mail} label="Email Address" value={profile.email} />
          </SectionCard>
        </motion.div>

        <motion.div variants={item}>
          <SectionCard title="Addresses">
            {profile.addresses.map(addr => (
              <ActionRow 
                key={addr.id} 
                icon={MapPin} 
                label={addr.label} 
                value={addr.isPrimary ? "Primary" : undefined} 
              />
            ))}
            <button className="w-full text-center p-3 text-sm font-bold text-[#0F4C81] mt-2">
              + Add New Address
            </button>
          </SectionCard>
        </motion.div>

        <motion.div variants={item}>
          <SectionCard title="Settings">
            <ToggleRow icon={Bell} label="Push Notifications" enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
            <ToggleRow icon={Smartphone} label="WhatsApp Updates" enabled={whatsappEnabled} onToggle={() => setWhatsappEnabled(!whatsappEnabled)} />
            <ToggleRow icon={Moon} label="Dark Mode" enabled={darkEnabled} onToggle={() => setDarkEnabled(!darkEnabled)} />
          </SectionCard>
        </motion.div>

        <motion.div variants={item}>
          <SectionCard title="Support & Legal">
            <ActionRow icon={Info} label="Help & Support" />
            <ActionRow icon={Shield} label="Privacy Policy" />
            <ActionRow icon={FileText} label="Terms of Service" />
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
