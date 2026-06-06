"use client";

import { Users, ClipboardList, Calendar, IndianRupee } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart, ServicesChart, SalesBarChart } from "@/components/dashboard/Charts";
import { useState, useEffect } from "react";


type DashboardData = {
  stats: {
    totalCustomers: number;
    totalProducts: number;
    totalLeads: number;
    totalAmcs: number;
    activeAmcs: number;
    todayAppointments: number;
    revenue: number;
  };
  recentAppointments: any[];
  expiringAmcs: any[];
  topTechnicians: any[];
  recentInstallations: any[];
  charts: {
    revenueChartData: any[];
    salesChartData: any[];
    servicesChartData: any[];
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLoading(true);
    let url = `/api/dashboard/stats?filter=${timeFilter}`;
    if (timeFilter === 'custom' && startDate && endDate) {
      url += `&start=${startDate}&end=${endDate}`;
    }
    
    // Only fetch if not custom, or if custom and both dates are selected
    if (timeFilter !== 'custom' || (startDate && endDate)) {
      fetch(url)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load dashboard metrics", err);
          setLoading(false);
        });
    } else {
      // Don't leave it loading infinitely if they haven't picked dates yet
      setLoading(false);
    }
  }, [timeFilter, startDate, endDate]);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading dashboard overview...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header Row with Title and Filter */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-sm">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
            </div>
          )}
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers"
          value={data.stats.totalCustomers.toString()}
          trend={`${data.stats.totalCustomers > 0 ? '+100' : '0'}%`}
          trendDirection="up"
          icon={Users}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard 
          title="Total Products"
          value={data.stats.totalProducts.toString()}
          trend="In catalog"
          trendDirection="up"
          icon={ClipboardList}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard 
          title="Active AMCs"
          value={data.stats.activeAmcs.toString()}
          trend="Contracts"
          trendDirection="up"
          icon={Calendar}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
        />
        <StatCard 
          title="Calculated Revenue"
          value={`₹ ${data.stats.revenue.toLocaleString('en-IN')}`}
          trend="Total paid"
          trendDirection="up"
          icon={IndianRupee}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data.charts?.revenueChartData} totalRevenue={data.stats.revenue} />
        </div>
        <div className="lg:col-span-1">
          <ServicesChart data={data.charts?.servicesChartData} />
        </div>
      </div>



      {/* Bottom Chart Row */}
      <div className="grid grid-cols-1 gap-6">
        <SalesBarChart data={data.charts?.salesChartData} totalSales={data.stats.revenue} />
      </div>

    </div>
  );
}
