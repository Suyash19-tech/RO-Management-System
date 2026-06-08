"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, ClipboardList, Calendar, IndianRupee, TrendingUp, AlertTriangle, 
  ArrowUpRight, ShoppingBag, Truck, Wrench, ShieldAlert, Star, DollarSign, Wallet
} from "lucide-react";
import { RevenueChart, ServicesChart, SalesBarChart } from "@/components/dashboard/Charts";

type DashboardData = {
  stats: {
    totalCustomers: number;
    totalProducts: number;
    activeAmcs: number;
    todayAppointments: number;
    revenue: number;
    expenses: number;
    netProfit: number;
    customerDues: number;
    supplierDues: number;
    lowStockCount: number;
  };
  recentAppointments: any[];
  recentInstallations: any[];
  expiringAmcs: any[];
  topTechnicians: any[];
  charts: {
    revenueChartData: any[];
    salesChartData: any[];
    servicesChartData: any[];
  };
};

function MiniCard({ icon: Icon, title, value, color, link }: {
  icon: any; title: string; value: string | number; color: string; link: string;
}) {
  return (
    <Link href={link} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-all group hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-lg font-black text-slate-800 mt-0.5">{value}</p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("this_month");
  
  // Custom Date Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      let url = `/api/dashboard/stats?filter=${timeFilter}`;
      if (timeFilter === "custom" && startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load analytics");
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeFilter !== "custom" || (startDate && endDate)) {
      fetchDashboardData();
    }
    
    // Poll for updates every 10 seconds (less frequent for heavy dashboard stats)
    const interval = setInterval(() => {
      if (timeFilter !== "custom" || (startDate && endDate)) {
        fetchDashboardData();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [timeFilter, startDate, endDate]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header Row with Title and Timeframe Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Command Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Realtime analytics aggregated from sales, servicing, installations, inventory, and expenses.
          </p>
        </div>
        
        {/* Responsive Time Filters */}
        <div className="flex items-center gap-3 flex-wrap bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {timeFilter === "custom" && (
            <div className="flex items-center gap-2 px-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-bold text-slate-650 bg-transparent border-none outline-none cursor-pointer"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-bold text-slate-650 bg-transparent border-none outline-none cursor-pointer"
              />
            </div>
          )}
          
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border-none rounded-xl px-4 py-2.5 outline-none cursor-pointer transition-colors"
          >
            <option value="this_week">This Week (7 Days)</option>
            <option value="this_month">This Month (30 Days)</option>
            <option value="this_year">This Year (12 Months)</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Recalculating database metrics...</p>
        </div>
      ) : (
        <>
          {/* Section 1: Financial Health Cards (Main Metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Revenue */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all bg-gradient-to-br from-blue-50/20 to-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-black text-slate-900">
                    ₹{data.stats.revenue.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600">Dynamic</span> collected cash inflow
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all bg-gradient-to-br from-emerald-50/20 to-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</p>
                  <p className={`text-3xl font-black ${data.stats.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    ₹{data.stats.netProfit.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <span className={data.stats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {data.stats.netProfit >= 0 ? "Profit" : "Loss"}
                </span>
                after operational expense deduction
              </div>
            </div>

            {/* Outstanding Customer Dues */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all bg-gradient-to-br from-amber-50/20 to-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uncollected Sales</p>
                  <p className="text-3xl font-black text-amber-600">
                    ₹{data.stats.customerDues.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Outstanding customer balances
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all bg-gradient-to-br from-rose-50/20 to-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outflow Expenses</p>
                  <p className="text-3xl font-black text-rose-600">
                    ₹{data.stats.expenses.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <span>Total cash paid to suppliers/staff</span>
              </div>
            </div>

          </div>

          {/* Section 2: Secondary Tab Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniCard icon={Users} title="Total Customers" value={data.stats.totalCustomers} color="bg-blue-50 text-blue-600" link="/dashboard/customers" />
            <MiniCard icon={Calendar} title="Active AMC Plans" value={data.stats.activeAmcs} color="bg-indigo-50 text-indigo-600" link="/dashboard/amc" />
            <MiniCard icon={AlertTriangle} title="Low Stock Items" value={data.stats.lowStockCount > 0 ? `${data.stats.lowStockCount} items` : "Healthy"} color={data.stats.lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"} link="/dashboard/inventory" />
            <MiniCard icon={Wrench} title="Today's Jobs" value={data.stats.todayAppointments} color="bg-sky-50 text-sky-600" link="/dashboard/appointments" />
          </div>

          {/* Section 3: Charts & Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart data={data.charts?.revenueChartData} totalRevenue={data.stats.revenue} />
            </div>
            <div className="lg:col-span-1">
              <ServicesChart data={data.charts?.servicesChartData} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SalesBarChart data={data.charts?.salesChartData} totalSales={data.stats.revenue} />
          </div>

          {/* Section 4: Live Feeds from all tabs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Left: Recent Service Appointments & Expiring AMCs */}
            <div className="space-y-6">
              
              {/* Box 1: Recent Appointments */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-sm">Recent Appointments</h3>
                  <Link href="/dashboard/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Manage Appointments <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {data.recentAppointments.length > 0 ? (
                    data.recentAppointments.map((appt: any) => (
                      <div key={appt.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{appt.customerName}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{appt.type} · {appt.time}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                          appt.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : appt.status === "Scheduled" ? "bg-blue-50 text-blue-600 border-blue-100"
                          : appt.status === "In Progress" ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-slate-50 text-slate-500 border-slate-100"
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">No service appointments recorded.</p>
                  )}
                </div>
              </div>

              {/* Box 2: Expiring AMCs */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-sm">AMC Expirations / Renewals Needed</h3>
                  <Link href="/dashboard/amc" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Renewal Panel <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {data.expiringAmcs.length > 0 ? (
                    data.expiringAmcs.map((amc: any) => (
                      <div key={amc.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{amc.customerName}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{amc.plan}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                          amc.status === "Expired" ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {amc.status === "Expired" ? "Expired" : "Expiring"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">All AMC contracts healthy.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Recent Installations & Top Technicians */}
            <div className="space-y-6">
              
              {/* Box 3: Recent Installations */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-sm">Recent Installations</h3>
                  <Link href="/dashboard/installations" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Installation Manager <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {data.recentInstallations.length > 0 ? (
                    data.recentInstallations.map((inst: any) => (
                      <div key={inst.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{inst.customerName}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{inst.model} · {formatDate(inst.date)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                          inst.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : inst.status === "Scheduled" ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {inst.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">No installations scheduled yet.</p>
                  )}
                </div>
              </div>

              {/* Box 4: Top Performing Technicians */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-sm">Top Technicians</h3>
                  <Link href="/dashboard/technicians" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Technicians Log <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {data.topTechnicians.length > 0 ? (
                    data.topTechnicians.map((tech: any) => (
                      <div key={tech.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{tech.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{tech.spec} · {tech.activeJobs} jobs active</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{tech.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">No technicians registered.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
