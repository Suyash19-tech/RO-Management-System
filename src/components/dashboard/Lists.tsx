"use client";

import { Star, ClipboardList } from "lucide-react";

// Status Badge Component
function Badge({ status, text }: { status: "pending" | "in-progress" | "completed" | "open" | "resolved" | "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Pending", text: string }) {
  const styles: Record<string, string> = {
    "pending": "bg-amber-100 text-amber-700",
    "in-progress": "bg-blue-100 text-blue-700",
    "completed": "bg-emerald-100 text-emerald-700",
    "open": "bg-rose-100 text-rose-700",
    "resolved": "bg-emerald-100 text-emerald-700",
    "Scheduled": "bg-blue-100 text-blue-700",
    "In Progress": "bg-purple-100 text-purple-700",
    "Completed": "bg-emerald-100 text-emerald-700",
    "Cancelled": "bg-slate-100 text-slate-600",
    "Pending": "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {text}
    </span>
  );
}

// Avatar Component
function Avatar({ name }: { name: string }) {
  const colors = ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700"];
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export function RecentAppointmentsList({ data }: { data?: any[] }) {
  // Fallback to mock data if none provided
  const appointments = data || [
    { customerName: "Rahul Sharma", date: "16 May, 10:00 AM", status: "Pending" },
    { customerName: "Priya Verma", date: "16 May, 11:30 AM", status: "In Progress" },
    { customerName: "Amit Kumar", date: "16 May, 02:00 PM", status: "Pending" },
    { customerName: "Neha Singh", date: "16 May, 04:30 PM", status: "Completed" },
    { customerName: "Vikash Patel", date: "16 May, 05:30 PM", status: "Pending" },
  ];

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
        <a href="/dashboard/appointments" className="text-sm font-medium text-[#2563EB] hover:underline">View all</a>
      </div>
      <div className="flex flex-col gap-5">
        {appointments.map((apt, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={apt.customerName || apt.name} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{apt.customerName || apt.name}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{formatDate(apt.date)} {apt.time || ""}</p>
              </div>
            </div>
            <Badge status={apt.status as any} text={apt.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AMCExpiringList({ data }: { data?: any[] }) {
  const amcs = data || [
    { customerName: "Sunil Yadav", endDate: "20 May, 2024", plan: "Basic 1-Year AMC" },
    { customerName: "Meena Joshi", endDate: "22 May, 2024", plan: "Standard AMC" },
  ];

  const getDaysLeft = (endDateStr: string) => {
    try {
      const end = new Date(endDateStr);
      const diffTime = end.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 5;
    }
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">AMC Expiring Soon</h3>
        <a href="/dashboard/amc" className="text-sm font-medium text-[#2563EB] hover:underline">View all</a>
      </div>
      <div className="flex flex-col gap-5">
        {amcs.map((amc, idx) => {
          const daysLeft = getDaysLeft(amc.endDate);
          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={amc.customerName || amc.name} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{amc.customerName || amc.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{formatDate(amc.endDate)}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${daysLeft <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                {daysLeft || 3} Days Left
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopTechniciansList({ data }: { data?: any[] }) {
  const techs = data || [
    { name: "Arjun Singh", spec: "Installation & Repair", rating: 4.9, activeJobs: 3 },
    { name: "Ravi Kumar", spec: "Filter Changes", rating: 4.8, activeJobs: 5 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">Top Technicians</h3>
        <select className="text-sm font-medium text-slate-500 bg-transparent border-none outline-none cursor-pointer">
          <option>This Month</option>
        </select>
      </div>
      <div className="flex flex-col gap-5">
        {techs.map((tech, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={tech.name} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{tech.name}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Jobs: {tech.activeJobs} ({tech.spec})</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-900">{tech.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceRequestsList({ data }: { data?: any[] }) {
  // Show installations as recent requests on the dashboard
  const requests = data || [
    { customerName: "Rahul Sharma", model: "Pure Water RO X1", date: "24 May 2024", status: "Scheduled" },
    { customerName: "Priya Verma", model: "SardarJi Classic", date: "24 May 2024", status: "In Progress" },
  ];

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">Recent Installation Jobs</h3>
        <a href="/dashboard/installations" className="text-sm font-medium text-[#2563EB] hover:underline">View all</a>
      </div>
      <div className="flex flex-col gap-5">
        {requests.map((req, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{req.model}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{req.customerName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="text-[10px] font-medium text-slate-400">{formatDate(req.date)}</p>
              <Badge status={req.status as any} text={req.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
