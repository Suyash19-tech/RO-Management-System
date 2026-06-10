"use client";
import toast from "react-hot-toast";

import { Phone, Star, Trash2, Power } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

type Technician = {
  id: string;
  name: string;
  phone: string;
  spec: string;
  status: string;
  rating: number;
  activeJobs: number;
};

type TechniciansTableProps = {
  search: string;
  refreshTrigger: number;
  onRefresh: () => void;
};

function Avatar({ name }: { name: string }) {
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
    "bg-blue-100 text-blue-700"
  ];
  const color = colors[name.length % colors.length];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export function TechniciansTable({ search, refreshTrigger, onRefresh }: TechniciansTableProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTechnicians = () => {
    fetch('/api/technicians')
      .then(res => res.json())
      .then(data => {
        setTechnicians(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch technicians", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTechnicians();
  }, [refreshTrigger]);

  const handleToggleStatus = async (tech: Technician) => {
    const newStatus = tech.status === "On Duty" ? "Off Duty" : "On Duty";
    
    // confirmation before toggling
    const confirmed = window.confirm(`Change ${tech.name}'s status to ${newStatus}?`);
    if (!confirmed) return;

    setTogglingId(tech.id);
    try {
      const res = await fetch(`/api/technicians/${tech.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to toggle status");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteTech = async (tech: Technician) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to remove technician ${tech.name}? This will delete their workforce profile permanentely.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/technicians/${tech.id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete technician");
      toast.success(`${tech.name} has been removed.`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete technician. They may be linked to active service appointments.");
    }
  };

  // Client side filtering
  const filteredTechs = useMemo(() => {
    if (!search) return technicians;
    const q = search.toLowerCase();
    return technicians.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.spec.toLowerCase().includes(q) ||
        t.phone.includes(q)
    );
  }, [technicians, search]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading technicians...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTechs.map((item) => {
              const isOnDuty = item.status === "On Duty";
              return (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={item.name} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                        <span className="text-xs font-medium text-slate-500 mt-0.5">{item.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.spec}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-slate-900">
                          {item.rating.toFixed(1)} <span className="text-slate-400 font-medium">/ 5.0</span>
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#2563EB]">
                        {item.activeJobs} Active Jobs Today
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      disabled={togglingId === item.id}
                      title="Click to toggle duty status"
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                        isOnDuty
                          ? "bg-emerald-100 border border-emerald-200 text-emerald-700"
                          : "bg-slate-100 border border-slate-200 text-slate-500"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {item.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={`tel:${item.phone}`}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-95"
                        title={`Call ${item.name}`}
                      >
                        <Phone className="w-4.5 h-4.5" />
                      </a>
                      
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-95`}
                        title="Toggle duty status"
                      >
                        <Power className="w-4.5 h-4.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteTech(item)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                        title="Remove Technician"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredTechs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold text-sm">
                  No technicians found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
