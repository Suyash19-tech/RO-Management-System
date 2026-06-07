"use client";
// AppointmentsTable — Step Wizard + Invoice

import {
  Calendar, MapPin, Clock, User, Wrench,
  CheckCircle2, X, Plus, Trash2, FileText, IndianRupee,
  Package, MessageSquare, ClipboardCheck, Download,
  ChevronRight, ChevronLeft, Phone, Search
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

/* ─────────────── Types ─────────────── */
type LineItem = { name: string; qty: number; cost: number };
export type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  type: string;
  tech: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  remarks?: string | null;
  itemsUsed?: string | null;
  costCharged?: number | null;
  paymentStatus?: string | null;
  customer?: { installations: { servicesCount: number }[] } | null;
};

/* ─────────────── Helpers ─────────────── */
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  if (!name || name === "Unassigned")
    return <div className={`${sz} rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0`}><User className="w-4 h-4" /></div>;
  const colors = ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700"];
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  return <div className={`${sz} rounded-full flex items-center justify-center font-black shrink-0 ${color}`}>{initials}</div>;
}
function TypePill({ type }: { type: string }) {
  const map: Record<string, string> = {
    "Installation": "bg-blue-50 text-blue-700 border-blue-200",
    "Repair Service": "bg-rose-50 text-rose-700 border-rose-200",
    "AMC Visit": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Routine Maintenance": "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${map[type] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{type}</span>;
}
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { "Scheduled": "bg-blue-100 text-blue-700", "In Progress": "bg-purple-100 text-purple-700", "Completed": "bg-emerald-100 text-emerald-700" };
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}
function PayPill({ status }: { status?: string | null }) {
  const map: Record<string, string> = { "Paid": "bg-emerald-100 text-emerald-700", "Unpaid": "bg-rose-100 text-rose-700", "Free": "bg-slate-100 text-slate-600" };
  return status ? <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span> : null;
}
function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ═══════════════════════════════════════════════════
   PROFESSIONAL INVOICE
═══════════════════════════════════════════════════ */
export function InvoiceView({ apt, onClose }: { apt: Appointment; onClose: () => void }) {
  const items: LineItem[] = (() => { try { return apt.itemsUsed ? JSON.parse(apt.itemsUsed) : []; } catch { return []; } })();
  const total = apt.costCharged ?? 0;
  const invoiceNo = `SVC-${apt.id.slice(-8).toUpperCase()}-${new Date(apt.completedAt || apt.date).getFullYear()}`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-8">
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { margin:15mm; size:A4; } body *{visibility:hidden} #svc-printable,#svc-printable *{visibility:visible} #svc-printable{position:absolute;left:0;top:0;width:100%;background:white!important;box-shadow:none!important;border:none!important;padding:0!important;margin:0!important} .no-print{display:none!important} }` }} />
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 my-2 sm:my-8">
        <div className="no-print flex justify-end gap-2">
          <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-5 py-3.5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Save as PDF / Print
          </button>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-lg transition-colors flex items-center justify-center shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div id="svc-printable" className="bg-white w-full rounded-xl shadow-2xl p-6 sm:p-12 border border-slate-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">SARDARJI RO</h1>
              <p className="text-slate-600 mt-1 text-sm font-medium">Pure Water Solutions & AMC Experts</p>
              <p className="text-slate-600 text-sm mt-0.5">Delhi NCR Region, India</p>
              <p className="text-slate-600 text-sm font-medium mt-0.5">GSTIN: 07ABCDE1234F1Z5</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest">Invoice</h2>
              <p className="text-slate-900 font-bold mt-2">{invoiceNo}</p>
              <p className="text-slate-600 font-medium text-sm">Date: {new Date(apt.completedAt || apt.date).toLocaleDateString("en-IN")}</p>
              <div className="mt-2">
                {apt.paymentStatus === "Free" ? <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase">Free Service</span>
                  : apt.paymentStatus === "Paid" ? <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase">Paid</span>
                  : <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase">Unpaid</span>}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-black">{apt.customerName}</h3>
              <p className="text-slate-600 font-medium text-sm mt-1">{apt.address}</p>
              {apt.customerPhone && <p className="text-slate-600 font-medium text-sm mt-0.5">Ph: {apt.customerPhone}</p>}
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border border-slate-100 sm:border-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Service Details</p>
              <p className="text-slate-900 font-bold text-sm">{apt.type}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5"><span className="text-slate-500">Technician:</span> {apt.tech}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5"><span className="text-slate-500">Ticket:</span> {apt.id.slice(-8).toUpperCase()}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5"><span className="text-slate-500">Payment:</span> {apt.paymentStatus || "—"}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead><tr className="border-b-2 border-black text-left">
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">Qty</th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-32">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td className="py-4"><p className="font-bold text-black">{apt.type} — Service Visit</p><p className="text-xs text-slate-500 mt-1">On-site service by {apt.tech}</p></td>
                  <td className="py-4 text-center font-bold text-black">1</td>
                  <td className="py-4 text-right font-bold text-black">₹{total.toLocaleString("en-IN")}</td>
                </tr>
              ) : (<>
                <tr>
                  <td className="py-4"><p className="font-bold text-black">{apt.type} — Service Visit</p><p className="text-xs text-slate-500 mt-1">On-site service by {apt.tech}</p></td>
                  <td className="py-4 text-center font-bold text-black">1</td>
                  <td className="py-4 text-right text-slate-400">—</td>
                </tr>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 pl-4"><p className="font-medium text-black">{item.name}</p><p className="text-xs text-slate-500 mt-0.5">Part / Material</p></td>
                    <td className="py-4 text-center text-slate-700 font-semibold">{item.qty}</td>
                    <td className="py-4 text-right font-bold text-black">₹{(item.cost * item.qty).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </>)}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-full sm:w-72 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-slate-600 font-medium"><span>Subtotal</span><span className="font-bold text-black">₹{total.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm text-slate-600 font-medium border-b border-slate-300 pb-3"><span>GST / Tax</span><span className="text-slate-500">Included</span></div>
              <div className="flex justify-between text-lg font-black text-black pt-1"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              {apt.paymentStatus === "Paid" && <div className="flex justify-between text-sm text-black bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg"><span className="font-bold">Amount Paid</span><span className="font-black">₹{total.toLocaleString("en-IN")}</span></div>}
              {apt.paymentStatus === "Unpaid" && <div className="flex justify-between text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg"><span className="font-bold">Balance Due</span><span className="font-black">₹{total.toLocaleString("en-IN")}</span></div>}
              {apt.paymentStatus === "Free" && <div className="flex justify-between text-sm text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"><span className="font-bold">Warranty / Free Visit</span><span className="font-black">₹0</span></div>}
            </div>
          </div>

          {apt.remarks && <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8"><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Technician Remarks</p><p className="text-sm text-slate-700 font-medium">{apt.remarks}</p></div>}

          <div className="border-t border-slate-200 pt-8 text-center">
            <p className="text-black font-bold">Thank you for choosing Sardar Ji RO!</p>
            <p className="text-slate-500 font-medium text-xs mt-1">For queries, contact your nearest Sardar Ji RO service center.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP-BY-STEP COMPLETION WIZARD
═══════════════════════════════════════════════════ */
const STEPS = ["Review", "Parts & Items", "Billing", "Done"];

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 px-6 pt-5 pb-4 border-b border-slate-100">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              i < step ? "bg-emerald-500 text-white" : i === step ? "bg-[#0B1B3D] text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold whitespace-nowrap ${i === step ? "text-[#0B1B3D]" : i < step ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CompletionWizard({
  apt, onClose, onDone, onViewInvoice
}: {
  apt: Appointment;
  onClose: () => void;
  onDone: () => void;
  onViewInvoice: (apt: Appointment) => void;
}) {
  const [step, setStep] = useState(0);
  const [remarks, setRemarks] = useState(apt.remarks || "");
  const [items, setItems] = useState<LineItem[]>(() => { try { return apt.itemsUsed ? JSON.parse(apt.itemsUsed) : []; } catch { return []; } });
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Unpaid" | "Free">((apt.paymentStatus as any) || "Unpaid");
  const [saving, setSaving] = useState(false);
  const [completedApt, setCompletedApt] = useState<Appointment | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter to only active, non-AMC products with stock > 0
          const filtered = data.filter(
            (p) => p.status === "Active" && p.category !== "AMC Plan" && p.stock > 0
          );
          setAvailableProducts(filtered);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const totalCost = items.reduce((s, i) => s + i.cost * i.qty, 0);

  const addItem = () => setItems((p) => [...p, { name: "", qty: 1, cost: 0 }]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, val: string | number) =>
    setItems((p) => p.map((item, i) => i === idx ? { ...item, [field]: field === "name" ? val : Number(val) } : item));

  const handleComplete = async () => {
    setSaving(true);
    const finalCost = paymentStatus === "Free" ? 0 : totalCost;
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          remarks,
          itemsUsed: JSON.stringify(items),
          costCharged: finalCost,
          paymentStatus,
          completedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setCompletedApt({ ...apt, ...updated });
      setStep(3);
      onDone(); // refresh + switch tab
    } catch {
      setSaving(false);
      alert("Failed to save. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="bg-[#0B1B3D] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-white">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
            <p className="font-bold text-base">Complete Service</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Step Bar */}
        <StepBar step={step} />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 0: REVIEW ── */}
          {step === 0 && (
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <Avatar name={apt.customerName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-xl font-black text-slate-900">{apt.customerName}</h2>
                    <TypePill type={apt.type} />
                  </div>
                  {apt.customerPhone && (
                    <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-semibold">{apt.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5 text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{apt.address}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Service Type</p>
                  <p className="font-bold text-slate-900">{apt.type}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Technician</p>
                  <div className="flex items-center gap-2">
                    <Avatar name={apt.tech} size="sm" />
                    <p className="font-bold text-slate-900 text-sm">{apt.tech}</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled</p>
                  <p className="font-bold text-slate-900 text-sm">{fmt(apt.date)}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{apt.time}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <StatusPill status={apt.status} />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Technician Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="What was done? Any issues found? Notes for the record..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:border-[#2563EB] outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ── STEP 1: PARTS & ITEMS ── */}
          {step === 1 && (
            <div className="p-6 flex flex-col gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">For: <span className="text-slate-700 font-bold">{apt.customerName}</span></p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Job: <span className="text-slate-700 font-bold">{apt.type}</span></p>
                </div>
                <button onClick={addItem} className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1B3D] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Part
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center gap-3">
                  <Package className="w-10 h-10 text-slate-300" />
                  <div>
                    <p className="font-bold text-slate-600">No parts or items used</p>
                    <p className="text-sm text-slate-400 mt-0.5">Skip this step if no materials were used in this service.</p>
                  </div>
                  <button onClick={addItem} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-slate-300 transition-colors">
                    <Plus className="w-4 h-4" /> Add a Part
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-12 gap-2 px-1">
                    <span className="col-span-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Part Name</span>
                    <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Qty</span>
                    <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Cost (₹)</span>
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-xl p-2 border border-slate-200">
                      <select
                        className="col-span-6 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB] cursor-pointer text-slate-800"
                        value={item.name}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          updateItem(idx, "name", selectedName);
                          const prod = availableProducts.find(p => p.name === selectedName);
                          if (prod) {
                            updateItem(idx, "cost", prod.price);
                            if (item.qty > prod.stock) {
                              updateItem(idx, "qty", prod.stock);
                            }
                          }
                        }}
                      >
                        <option value="" disabled>-- Select Part --</option>
                        {item.name && !availableProducts.some(p => p.name === item.name) && (
                          <option value={item.name}>{item.name} (Out of Stock / Pre-filled)</option>
                        )}
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} (Stock: {p.stock}, ₹{p.price})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="col-span-2 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB] text-center"
                        value={item.qty}
                        min={1}
                        max={(() => {
                          const prod = availableProducts.find(p => p.name === item.name);
                          return prod ? prod.stock : undefined;
                        })()}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          const prod = availableProducts.find(p => p.name === item.name);
                          const maxVal = prod ? prod.stock : Infinity;
                          updateItem(idx, "qty", Math.min(val, maxVal));
                        }}
                      />
                      <input type="number" className="col-span-3 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB] text-right" value={item.cost} min={0} placeholder="0" onChange={(e) => updateItem(idx, "cost", e.target.value)} />
                      <button onClick={() => removeItem(idx)} className="col-span-1 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-1 px-1">
                    <span className="text-sm font-bold text-slate-500">Total Parts Cost</span>
                    <span className="text-xl font-black text-slate-900">₹{totalCost.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: BILLING ── */}
          {step === 2 && (
            <div className="p-6 flex flex-col gap-5">
              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Service Summary</p>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={apt.customerName} />
                  <div>
                    <p className="font-black text-slate-900">{apt.customerName}</p>
                    <p className="text-sm text-slate-500 font-medium">{apt.address}</p>
                    <div className="mt-1"><TypePill type={apt.type} /></div>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 mt-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Parts Used</p>
                    <div className="flex flex-col gap-1.5">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-600 font-medium">{item.name} <span className="text-slate-400">×{item.qty}</span></span>
                          <span className="font-bold text-slate-900">₹{(item.cost * item.qty).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 pt-3 border-t-2 border-slate-900">
                  <span className="font-black text-slate-900">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">₹{(paymentStatus === "Free" ? 0 : totalCost).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Payment Selection */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <IndianRupee className="w-3.5 h-3.5" /> Payment Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["Paid", "Unpaid", "Free"] as const).map((s) => (
                    <button key={s} onClick={() => setPaymentStatus(s)}
                      className={`py-4 rounded-2xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentStatus === s
                          ? s === "Paid" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100"
                            : s === "Free" ? "border-slate-400 bg-slate-100 text-slate-700"
                            : "border-rose-500 bg-rose-50 text-rose-700 shadow-lg shadow-rose-100"
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                      }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        paymentStatus === s
                          ? s === "Paid" ? "bg-emerald-100" : s === "Free" ? "bg-slate-200" : "bg-rose-100"
                          : "bg-slate-100"
                      }`}>
                        {s === "Paid" ? <CheckCircle2 className="w-4 h-4" /> : s === "Free" ? <Wrench className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <span>{s === "Paid" ? "Paid" : s === "Free" ? "Free Service" : "Unpaid"}</span>
                    </button>
                  ))}
                </div>
                {paymentStatus === "Free" && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Invoice will show ₹0 — this is a warranty or complimentary visit.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: DONE ── */}
          {step === 3 && (
            <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <p className="font-black text-2xl text-slate-900">Service Completed!</p>
                <p className="text-slate-500 mt-1">Invoice is ready. View it in the Completed tab.</p>
              </div>
              {completedApt && (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-600">Total Charged</span>
                    <span className="text-xl font-black text-slate-900">₹{(completedApt.costCharged ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                  <PayPill status={completedApt.paymentStatus} />
                </div>
              )}
              {completedApt && (
                <button onClick={() => { onClose(); onViewInvoice(completedApt); }}
                  className="w-full py-3.5 bg-[#0B1B3D] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                  <FileText className="w-5 h-5" /> View & Print Invoice
                </button>
              )}
              <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 font-medium">Close</button>
            </div>
          )}
        </div>

        {/* Footer Nav — hidden on step 3 */}
        {step < 3 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : onClose()}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> {step === 0 ? "Cancel" : "Back"}
            </button>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[#0B1B3D]" : i < step ? "w-3 bg-emerald-400" : "w-3 bg-slate-200"}`} />
              ))}
            </div>
            {step < 2 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1B3D] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-colors">
                {saving ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? "Saving..." : "Complete Service"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// No module-level hack needed — onViewInvoice passed as prop

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export function AppointmentsTable() {
  const [all, setAll] = useState<Appointment[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [payFilter, setPayFilter] = useState<"all" | "Paid" | "Unpaid" | "Free">("all");
  const [search, setSearch] = useState("");
  const [completionApt, setCompletionApt] = useState<Appointment | null>(null);
  const [invoiceApt, setInvoiceApt] = useState<Appointment | null>(null);

  const fetchAll = async () => {
    try {
      const [appRes, techRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/technicians")
      ]);
      const appData = await appRes.json();
      const techData = await techRes.json();
      setAll(Array.isArray(appData) ? appData : []);
      setTechnicians(Array.isArray(techData) ? techData.filter((t: any) => t.status === "On Duty") : []);
    } catch { /**/ } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const active = all.filter((a) => ["Scheduled", "In Progress"].includes(a.status));
  const completed = all.filter((a) => a.status === "Completed");

  const filteredCompleted = completed.filter((a) => {
    const matchPay = payFilter === "all" || a.paymentStatus === payFilter;
    const matchSearch = !search || a.customerName.toLowerCase().includes(search.toLowerCase()) || a.tech.toLowerCase().includes(search.toLowerCase()) || a.address.toLowerCase().includes(search.toLowerCase());
    return matchPay && matchSearch;
  });
  const filteredActive = active.filter((a) =>
    !search || a.customerName.toLowerCase().includes(search.toLowerCase()) || a.tech.toLowerCase().includes(search.toLowerCase())
  );

  const handleDone = () => { fetchAll(); setTab("completed"); };

  const handleAssignTech = async (id: string, techName: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tech: techName })
      });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to assign technician");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading appointments...</div>;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Controls Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

        {/* Row 1: Tabs */}
        <div className="flex items-center gap-3 px-4 pt-4 border-b border-slate-100 pb-0">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
            {(["active", "completed"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? "bg-white text-[#0B1B3D] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "active" ? <Calendar className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {t === "active" ? "Active" : "Completed"}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  t === "active" && tab === "active" ? "bg-blue-100 text-blue-700"
                  : t === "completed" && tab === "completed" ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
                }`}>{t === "active" ? active.length : completed.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Search + Pay Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, technician..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>
          {tab === "completed" && (
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
              {(["all", "Paid", "Unpaid", "Free"] as const).map((f) => (
                <button key={f} onClick={() => setPayFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${payFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── ACTIVE TAB CONTENT ── */}
        {tab === "active" && (
          <div className="p-4">
            {filteredActive.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center">
                <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-bold text-slate-700">No active appointments</p>
                <p className="text-sm text-slate-400 mt-1">All jobs done or none scheduled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActive.map((apt) => (
                  <div key={apt.id} onClick={() => setCompletionApt(apt)}
                    className="bg-slate-50 rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar name={apt.customerName} />
                        <div className="min-w-0">
                          {apt.customerPhone ? (
                            <Link href={`/dashboard/customers/${encodeURIComponent(apt.customerPhone)}`} onClick={(e) => e.stopPropagation()}>
                              <h3 className="font-bold text-slate-900 group-hover:text-[#2563EB] hover:underline transition-colors">{apt.customerName}</h3>
                            </Link>
                          ) : (
                            <h3 className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">{apt.customerName}</h3>
                          )}
                          <div className="flex flex-col mt-1 gap-1">
                            <div className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <p className="text-xs font-medium line-clamp-1">{apt.address}</p>
                            </div>
                            {apt.customer?.installations?.[0] !== undefined && (
                              <div className="flex items-center mt-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {apt.customer.installations[0].servicesCount} Services Left
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <StatusPill status={apt.status} />
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 mb-4 flex-1">
                      <TypePill type={apt.type} />
                      <div className="flex items-center gap-1.5 mt-2 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold">{apt.time}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-sm text-slate-500">{fmt(apt.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <div className="flex items-center gap-2 relative group">
                        <Avatar name={apt.tech} size="sm" />
                        <select
                          value={apt.tech}
                          onChange={(e) => handleAssignTech(apt.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-sm font-semibold bg-transparent outline-none appearance-none cursor-pointer hover:underline ${apt.tech === "Unassigned" ? "text-amber-600" : "text-slate-700"}`}
                        >
                          <option value="Unassigned">Unassigned</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1 text-[#2563EB] text-xs font-bold">
                        Mark Done <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLETED TAB CONTENT ── */}
        {tab === "completed" && (
          <div className="p-4">
            {filteredCompleted.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-bold text-slate-700">No completed appointments</p>
                <p className="text-sm text-slate-400 mt-1">Completed services appear here once marked done.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {filteredCompleted.map((apt) => {
                  const itms: LineItem[] = (() => { try { return apt.itemsUsed ? JSON.parse(apt.itemsUsed) : []; } catch { return []; } })();
                  const cost = apt.costCharged ?? 0;
                  return (
                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-start gap-4 py-5 hover:bg-slate-50 rounded-xl px-2 transition-colors">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar name={apt.customerName} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            {apt.customerPhone ? (
                              <Link href={`/dashboard/customers/${encodeURIComponent(apt.customerPhone)}`} onClick={(e) => e.stopPropagation()}>
                                <h3 className="font-bold text-slate-900 text-sm hover:text-[#2563EB] hover:underline transition-colors">{apt.customerName}</h3>
                              </Link>
                            ) : (
                              <h3 className="font-bold text-slate-900 text-sm">{apt.customerName}</h3>
                            )}
                            <TypePill type={apt.type} />
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 shrink-0" /><p className="text-xs font-medium">{apt.address}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="text-xs text-slate-500">Completed: <span className="text-slate-700 font-semibold">{fmt(apt.completedAt)}</span></span>
                            <div className="flex items-center gap-1.5"><Avatar name={apt.tech} size="sm" /><span className="text-xs font-semibold text-slate-700">{apt.tech}</span></div>
                          </div>
                          {apt.remarks && <p className="text-xs text-slate-500 mt-1.5 bg-slate-100 rounded-lg px-3 py-1.5 italic max-w-sm line-clamp-2">"{apt.remarks}"</p>}
                          {itms.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {itms.map((item, i) => <span key={i} className="text-[11px] font-bold bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-600">{item.name} ×{item.qty}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900">₹{cost.toLocaleString("en-IN")}</p>
                          <PayPill status={apt.paymentStatus} />
                        </div>
                        <button onClick={() => setInvoiceApt(apt)} className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3D] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors">
                          <FileText className="w-3.5 h-3.5" /> Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {completionApt && <CompletionWizard apt={completionApt} onClose={() => setCompletionApt(null)} onDone={handleDone} onViewInvoice={setInvoiceApt} />}
      {invoiceApt && <InvoiceView apt={invoiceApt} onClose={() => setInvoiceApt(null)} />}
    </div>
  );
}
