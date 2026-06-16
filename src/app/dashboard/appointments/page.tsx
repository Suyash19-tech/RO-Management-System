"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppointmentsTable } from "@/components/dashboard/AppointmentsTable";
import { NewServiceModal } from "@/components/dashboard/NewServiceModal";
import { useSWRConfig } from "swr";

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate } = useSWRConfig();

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage all scheduled services — track active jobs and view completed service history with invoices.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1B3D] hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          New Service Onboarding
        </button>
      </div>

      <AppointmentsTable />

      <NewServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate('/api/appointments')}
      />
    </div>
  );
}
