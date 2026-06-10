"use client";

import { Search, Users, Phone, MapPin, Calendar, ChevronRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  status: string;
  joinDate: string;
};

/* ─── Avatar ─── */
function Avatar({ name }: { name: string }) {
  const palettes = [
    "from-sky-400 to-blue-600",
    "from-purple-400 to-indigo-600",
    "from-rose-400 to-pink-600",
    "from-amber-400 to-orange-500",
    "from-teal-400 to-emerald-600",
    "from-violet-400 to-purple-600",
  ];
  const gradient = palettes[name.length % palettes.length];
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-lg text-white shrink-0 shadow-md`}>
      {initials}
    </div>
  );
}

export function CustomersTable() {
  const router = useRouter();
  const { data: fetchedCustomers, isLoading: loading } = useSWR("/api/customers", fetcher);
  const customers = Array.isArray(fetchedCustomers) ? fetchedCustomers : [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");

  const filtered = customers.filter((c) => {
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.phone.includes(search)
      || c.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = customers.filter((c) => c.status === "Active").length;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1"><div className="h-4 bg-slate-200 rounded-lg mb-2 w-3/4" /><div className="h-3 bg-slate-100 rounded-lg w-1/2" /></div>
            </div>
            <div className="space-y-2"><div className="h-3 bg-slate-100 rounded-lg" /><div className="h-3 bg-slate-100 rounded-lg w-4/5" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">{customers.length}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Total</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">{activeCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">{customers.length - activeCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Inactive</p>
          </div>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile number, or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-[#2563EB] transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
          {(["all", "Active", "Inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-400 shrink-0 text-center sm:text-left">
          {filtered.length} {filtered.length === 1 ? "customer" : "customers"}
        </span>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-bold text-slate-700 text-lg">No customers found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? `No results for "${search}"` : "No customers match the selected filter."}
          </p>
        </div>
      )}

      {/* ── Cards Grid ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              onClick={() => router.push(`/dashboard/customers/${encodeURIComponent(customer.phone)}`)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden"
            >
              {/* Card Top Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1B3D] to-[#2563EB] group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300" />

              <div className="p-5">
                {/* Header: Avatar + Status */}
                <div className="flex items-start justify-between mb-4">
                  <Avatar name={customer.name} />
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    customer.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {customer.status}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-[#2563EB] transition-colors mb-0.5">
                  {customer.name}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  ID: {customer.id.split("-")[0].toUpperCase()}
                </p>

                {/* Info rows */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 tracking-wide">{customer.phone}</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-500 line-clamp-2 leading-snug">{customer.address}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-slate-400">@</span>
                      </div>
                      <span className="text-sm font-medium text-slate-500 truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      Joined {new Date(customer.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
