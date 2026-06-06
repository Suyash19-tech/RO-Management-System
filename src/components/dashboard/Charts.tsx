"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

// Default Fallbacks (Original Mock Data)
const defaultRevenueData = [
  { name: '1', value: 0 }, { name: '5', value: 0 }, { name: '10', value: 0 },
  { name: '15', value: 0 }, { name: '20', value: 0 }, { name: '25', value: 0 },
  { name: '30', value: 0 }
];

const defaultServicesData = [
  { name: 'Completed', value: 0, color: '#10B981' },
  { name: 'Pending', value: 0, color: '#3B82F6' },
  { name: 'In Progress', value: 0, color: '#F59E0B' },
  { name: 'Cancelled', value: 0, color: '#EF4444' },
];

const defaultSalesData = Array.from({ length: 30 }, (_, i) => ({
  name: (i + 1).toString(),
  value: 0
}));

export function RevenueChart({ data, totalRevenue = 0 }: { data?: any[], totalRevenue?: number }) {
  const chartData = data && data.length > 0 ? data : defaultRevenueData;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
      </div>
      <div className="mb-4">
        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold text-slate-900">₹ {totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-sm font-semibold text-emerald-600 mb-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Live <span className="text-slate-400 font-medium ml-1">database metrics</span>
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val}`} />
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "#fff", strokeWidth: 2, stroke: "#3B82F6" }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ServicesChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : defaultServicesData;
  const total = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <h3 className="text-base font-bold text-slate-900 mb-6">Services Overview</h3>
      <div className="flex-1 flex flex-col 2xl:flex-row flex-wrap items-center justify-center gap-6">
        <div className="relative w-[160px] h-[160px] flex items-center justify-center shrink-0">
          <PieChart width={160} height={160}>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cx="50%"
              cy="50%"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#CBD5E1'} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">{total}</span>
            <span className="text-xs font-medium text-slate-500">Total</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[13px] font-semibold text-slate-900">{item.value}</span>
                <span className="text-[11px] font-medium text-slate-400 w-8 text-right">
                  ({total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0"}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SalesBarChart({ data, totalSales = 0 }: { data?: any[], totalSales?: number }) {
  const chartData = data && data.length > 0 ? data : defaultSalesData;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">Sales Overview</h3>
      </div>
      <div className="mb-6">
        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold text-slate-900">₹ {totalSales.toLocaleString('en-IN')}</span>
          <span className="text-sm font-semibold text-emerald-600 mb-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Live <span className="text-slate-400 font-medium ml-1">database sales</span>
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickMargin={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val}`} />
            <RechartsTooltip 
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" fill="#14B8A6" radius={[2, 2, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
