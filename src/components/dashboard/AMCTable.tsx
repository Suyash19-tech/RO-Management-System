"use client";
import toast from "react-hot-toast";

import { 
  MoreVertical, Eye, RefreshCw, Bell, MapPin, CalendarDays, 
  Search, Filter, Download, Plus, Trash2, X, Shield, 
  CheckCircle2, User, Phone, Sparkles, Clock, CreditCard, 
  ChevronRight, Calendar, Info, AlertTriangle, AlertCircle,
  FileText
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* --------------- Types --------------- */
type Amc = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  payment: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: string;
};

type AmcPlan = {
  id: string;
  name: string;
  sku: string;
  price: number;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "info" | "warning";
};

/* --------------- Avatars & Badges --------------- */
function Avatar({ name }: { name: string }) {
  const colors = ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700"];
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${color}`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Expiring Soon": "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-50",
    "Expired": "bg-rose-50 text-rose-700 border-rose-200",
    "Renewed": "bg-slate-100 text-slate-500 border-slate-300",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold tracking-wide uppercase whitespace-nowrap ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Paid": "text-emerald-700 bg-emerald-50 border-emerald-200",
    "Pending": "text-rose-700 bg-rose-50 border-rose-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
      {status}
    </span>
  );
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getPlanPrice = (planName: string) => {
  if (!planName) return 1500;
  const name = planName.toLowerCase();
  if (name.includes("premium 2-year") || name.includes("premium 2y")) return 4000;
  if (name.includes("premium 1-year") || name.includes("premium 1y")) return 2500;
  if (name.includes("standard 2-year") || name.includes("standard 2y")) return 3000;
  if (name.includes("basic 2-year") || name.includes("basic 2y")) return 2000;
  if (name.includes("basic 1-year") || name.includes("basic 1y")) return 1500;
  
  // Fallback pattern match for numbers like ₹1,500
  const match = planName.match(/₹\s*([\d,]+)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 1500;
};

export function AmcPaymentModal({ 
  amc, onClose, onUpdate 
}: { 
  amc: Amc; onClose: () => void; onUpdate: () => void 
}) {
  const totalAmount = (amc as any).totalAmount || getPlanPrice(amc.plan);
  const currentPaid = (amc as any).amountPaid || 0;
  const currentBalance = (amc as any).balanceDue !== undefined ? (amc as any).balanceDue : (totalAmount - currentPaid);

  const [payAmount, setPayAmount] = useState(String(currentBalance));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    if (parsedAmount > currentBalance) {
      toast.error(`Amount entered (₹${parsedAmount}) exceeds the remaining balance (₹${currentBalance}).`);
      return;
    }

    const isConfirmed = window.confirm(`Are you sure you want to record a payment of ₹${parsedAmount.toLocaleString("en-IN")} for ${amc.customerName}?`);
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const newPaid = currentPaid + parsedAmount;
      const res = await fetch(`/api/amc/${amc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaid: newPaid,
          totalAmount: totalAmount
        })
      });

      if (res.ok) {
        const updated = await res.json();
        // Mutate the local reference so state updates immediately if cached
        Object.assign(amc, updated);
        onUpdate();
        onClose();
      } else {
        toast.error("Failed to update payment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while saving payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
        <div className="bg-[#0B1B3D] px-6 py-4 flex items-center justify-between text-white">
          <p className="font-bold">Record AMC Payment</p>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-left">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <p className="font-bold text-slate-800">{amc.customerName}</p>
            <p className="text-xs text-slate-500 mt-1">{amc.plan}</p>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="font-extrabold text-slate-800 mt-0.5">₹{totalAmount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid</p>
                <p className="font-extrabold text-emerald-600 mt-0.5">₹{currentPaid.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</p>
                <p className="font-extrabold text-rose-600 mt-0.5">₹{currentBalance.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Amount Now Received (₹)
            </label>
            <input 
              type="number"
              step="any"
              min="1"
              max={currentBalance}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl transition-all shadow-lg active:scale-95"
            >
              {submitting ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AmcInvoiceView({ 
  amc, onClose, onUpdate 
}: { 
  amc: Amc; onClose: () => void; onUpdate?: () => void 
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const total = (amc as any).totalAmount || getPlanPrice(amc.plan);
  const paid = (amc as any).amountPaid || 0;
  const balance = (amc as any).balanceDue !== undefined ? (amc as any).balanceDue : (total - paid);
  const invoiceNo = `INV-AMC-${amc.id.slice(-6).toUpperCase()}-${new Date(amc.startDate).getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] overflow-y-auto p-4 sm:p-8">
      {/* Styles for printing */}
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { margin: 15mm; size: A4; } body * { visibility: hidden; } #amc-printable, #amc-printable * { visibility: visible; } #amc-printable { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; background: white !important; box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; } .no-print { display: none !important; } }` }} />
      
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 my-2 sm:my-8">
        
        {/* Actions Row */}
        <div className="flex justify-between items-center gap-3 no-print">
          <div>
            {balance > 0 && (
              <button 
                onClick={() => setShowPayModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> Collect Payment / Settle
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Save / Print
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-lg transition-colors flex items-center justify-center shrink-0 border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div id="amc-printable" className="bg-white w-full rounded-2xl shadow-2xl p-6 sm:p-12 border border-slate-200 shrink-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">SARDARJI RO</h1>
              <p className="text-slate-600 mt-1 text-sm font-medium">Pure Water Solutions & AMC Experts</p>
              <p className="text-slate-600 text-sm mt-1">Delhi NCR Region, India</p>
              <p className="text-slate-600 text-sm font-medium mt-1">GSTIN: 07ABCDE1234F1Z5</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest leading-none">Invoice</h2>
              <p className="text-slate-900 font-bold mt-3">{invoiceNo}</p>
              <p className="text-slate-600 font-medium text-sm mt-1">Date: {new Date(amc.startDate).toLocaleDateString("en-IN")}</p>
              <div className="mt-3">
                {balance <= 0 ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">Paid</span>
                ) : (
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wider">Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-black">{amc.customerName}</h3>
              <p className="text-slate-600 font-medium text-sm mt-1">{amc.address}</p>
              {amc.customerPhone && <p className="text-slate-600 font-medium text-sm mt-1">Ph: {amc.customerPhone}</p>}
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border border-slate-100 sm:border-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contract Details</p>
              <p className="text-slate-950 font-bold text-sm">{amc.plan}</p>
              <p className="text-slate-600 font-medium text-sm mt-1">ID: {amc.id}</p>
              <p className="text-slate-600 font-medium text-sm mt-1">Period: {formatDate(amc.startDate)} to {formatDate(amc.endDate)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Description</th>
                <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">Qty</th>
                <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-5">
                  <p className="font-bold text-black">Annual Maintenance Contract — {amc.plan}</p>
                  <p className="text-xs text-slate-500 mt-1">Comprehensive coverage including filter changes and support visits</p>
                </td>
                <td className="py-5 text-center font-bold text-black">1</td>
                <td className="py-5 text-right font-bold text-black">₹{total.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-full sm:w-72 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-black">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 font-medium border-b border-slate-300 pb-3">
                <span>GST / Tax (18%)</span>
                <span className="text-slate-500">Included</span>
              </div>
              <div className="flex justify-between text-lg font-black text-black pt-1 border-b border-slate-200 pb-2">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg mt-1">
                <span className="font-semibold">Amount Paid</span>
                <span className="font-bold">₹{paid.toLocaleString("en-IN")}</span>
              </div>
              {balance > 0 ? (
                <div className="flex justify-between text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg mt-1">
                  <span className="font-semibold">Balance Due</span>
                  <span className="font-bold">₹{balance.toLocaleString("en-IN")}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg mt-1">
                  <span className="font-semibold">Setted / Paid in Full</span>
                  <span className="font-bold">₹0</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-center">
            <p className="text-black font-bold">Thank you for choosing Sardar Ji RO!</p>
            <p className="text-slate-500 font-medium text-xs mt-1">For support or queries, contact us at our nearest service center.</p>
          </div>
        </div>
      </div>

      {showPayModal && (
        <AmcPaymentModal 
          amc={amc} 
          onClose={() => setShowPayModal(false)} 
          onUpdate={() => {
            if (onUpdate) onUpdate();
          }} 
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export function AMCTable() {
  const [amcData, setAmcData] = useState<Amc[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [amcPlans, setAmcPlans] = useState<AmcPlan[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  
  const [selectedAmc, setSelectedAmc] = useState<Amc | null>(null);
  const [invoiceAmc, setInvoiceAmc] = useState<Amc | null>(null);
  const [paymentAmc, setPaymentAmc] = useState<Amc | null>(null);
  
  // Form States
  const [addForm, setAddForm] = useState({
    id: "",
    customerName: "",
    customerPhone: "",
    address: "",
    plan: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "Active",
    payment: "Paid",
    amountPaid: "",
    isCustomCustomer: false
  });
  
  const [renewForm, setRenewForm] = useState({
    plan: "",
    startDate: "",
    endDate: "",
    payment: "Paid",
    amountPaid: ""
  });

  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Refs
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  /* --------------- Effects --------------- */
  useEffect(() => {
    fetchAMCs();
    fetchCustomers();
    fetchFormOptions();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --------------- Data Fetching --------------- */
  const fetchAMCs = async () => {
    try {
      const res = await fetch('/api/amc');
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setAmcData(items);
      if (selectedAmc) {
        const found = items.find((a: any) => a.id === selectedAmc.id);
        if (found) setSelectedAmc(found);
      }
    } catch (err) {
      console.error("Failed to fetch AMCs", err);
      showToast("Error loading AMC contracts", "warning");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const res = await fetch('/api/form-options');
      if (res.ok) {
        const data = await res.json();
        if (data.amcPlans) {
          setAmcPlans(data.amcPlans);
        }
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  };

  /* --------------- Toast System --------------- */
  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  /* --------------- Event Handlers --------------- */
  const handleDeleteAmc = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this AMC contract? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/amc/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast("AMC contract deleted successfully!");
        setAmcData(prev => prev.filter(a => a.id !== id));
        setIsViewModalOpen(false);
        setSelectedAmc(null);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      showToast("Could not delete AMC contract", "warning");
    }
  };

  const handleTogglePaymentStatus = async (item: Amc) => {
    if (item.payment === "Pending") {
      setPaymentAmc(item);
    } else {
      const isConfirmed = window.confirm(`Are you sure you want to mark the payment for ${item.customerName}'s contract as Pending (unpaid)?`);
      if (!isConfirmed) return;
      
      try {
        const res = await fetch(`/api/amc/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment: "Pending" })
        });
        if (res.ok) {
          const updated = await res.json();
          setAmcData(prev => prev.map(a => a.id === item.id ? updated : a));
          if (selectedAmc && selectedAmc.id === item.id) {
            setSelectedAmc(updated);
          }
          showToast(`Payment marked as Pending!`);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to update payment status", "warning");
      }
    }
  };

  const handleSendReminder = (item: Amc) => {
    showToast(`Renewal reminder successfully sent to ${item.customerName} via SMS & Email!`, "info");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.customerName.trim()) {
      showToast("Please select or enter a customer", "warning");
      return;
    }
    if (!addForm.plan) {
      showToast("Please select an AMC plan", "warning");
      return;
    }

    setSubmitting(true);
    // Generate a random visual ID if not set
    const finalId = addForm.id.trim() || `AMC-${Math.floor(5100 + Math.random() * 4800)}`;
    const price = getPlanPrice(addForm.plan);
    const amtPaid = addForm.payment === "Paid" ? price : Number(addForm.amountPaid || 0);
    const balance = Math.max(0, price - amtPaid);
    const payload = {
      id: finalId,
      customerName: addForm.customerName,
      customerPhone: addForm.customerPhone || null,
      address: addForm.address,
      plan: addForm.plan,
      startDate: new Date(addForm.startDate).toISOString(),
      endDate: new Date(addForm.endDate || calculateEndDate(addForm.startDate, addForm.plan)).toISOString(),
      status: addForm.status,
      payment: balance <= 0 ? "Paid" : "Pending",
      totalAmount: price,
      amountPaid: amtPaid,
      balanceDue: balance
    };

    try {
      const res = await fetch('/api/amc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newAmc = await res.json();
        setAmcData(prev => [newAmc, ...prev]);
        showToast("New AMC contract added successfully!");
        setIsAddModalOpen(false);
        setInvoiceAmc(newAmc);
        // Reset form
        setAddForm({
          id: "",
          customerName: "",
          customerPhone: "",
          address: "",
          plan: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          status: "Active",
          payment: "Paid",
          amountPaid: "",
          isCustomCustomer: false
        });
        setCustomerSearchQuery("");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to add AMC", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmc) return;

    setSubmitting(true);
    const finalId = `AMC-${Math.floor(5100 + Math.random() * 4800)}`;
    const price = getPlanPrice(renewForm.plan);
    const amtPaid = renewForm.payment === "Paid" ? price : Number(renewForm.amountPaid || 0);
    const balance = Math.max(0, price - amtPaid);
    const payload = {
      id: finalId,
      customerName: selectedAmc.customerName,
      customerPhone: selectedAmc.customerPhone,
      address: selectedAmc.address,
      plan: renewForm.plan,
      startDate: new Date(renewForm.startDate).toISOString(),
      endDate: new Date(renewForm.endDate).toISOString(),
      status: "Active",
      payment: balance <= 0 ? "Paid" : "Pending",
      totalAmount: price,
      amountPaid: amtPaid,
      balanceDue: balance
    };

    try {
      const res = await fetch('/api/amc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newAmc = await res.json();
        setAmcData(prev => [newAmc, ...prev]);
        
        // Also let's update the status of the OLD contract to "Active"
        await fetch(`/api/amc/${selectedAmc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: "Active" })
        });
        
        // Reset filters so the new Active contract is visible
        setStatusFilter("All");
        setPlanFilter("All");
        setPaymentFilter("All");
        setSearchQuery("");
        
        await fetchAMCs(); // reload all data to reflect statuses correctly
        showToast(`Contract renewed successfully as ${renewForm.plan}!`);
        setIsRenewModalOpen(false);
        setIsViewModalOpen(false);
        setSelectedAmc(null);
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Renewal failed. Please check inputs.", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------- Date Helpers --------------- */
  const calculateEndDate = (startStr: string, planName: string) => {
    if (!startStr) return "";
    const date = new Date(startStr);
    // Add years based on Plan name
    if (planName.includes("2-Year") || planName.includes("2Y")) {
      date.setFullYear(date.getFullYear() + 2);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    // Subtract 1 day for standard contract periods (e.g. 07 Jun 2026 to 06 Jun 2027)
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  const handleAddPlanChange = (p: string) => {
    const end = calculateEndDate(addForm.startDate, p);
    setAddForm(prev => ({ ...prev, plan: p, endDate: end }));
  };

  const handleAddStartDateChange = (date: string) => {
    const end = calculateEndDate(date, addForm.plan);
    setAddForm(prev => ({ ...prev, startDate: date, endDate: end }));
  };

  const handleRenewPlanChange = (p: string) => {
    const end = calculateEndDate(renewForm.startDate, p);
    setRenewForm(prev => ({ ...prev, plan: p, endDate: end }));
  };

  const handleRenewStartDateChange = (date: string) => {
    const end = calculateEndDate(date, renewForm.plan);
    setRenewForm(prev => ({ ...prev, startDate: date, endDate: end }));
  };

  const openRenewal = (amc: Amc) => {
    const defaultStart = new Date(amc.endDate);
    defaultStart.setDate(defaultStart.getDate() + 1); // Starts next day
    const startStr = defaultStart.toISOString().split("T")[0];
    const defaultPlan = amc.plan;
    const endStr = calculateEndDate(startStr, defaultPlan);

    setRenewForm({
      plan: defaultPlan,
      startDate: startStr,
      endDate: endStr,
      payment: "Paid",
      amountPaid: ""
    });
    setSelectedAmc(amc);
    setIsRenewModalOpen(true);
  };

  /* --------------- Autocomplete Customer Selector --------------- */
  const selectCustomer = (cust: Customer) => {
    setAddForm(prev => ({
      ...prev,
      customerName: cust.name,
      customerPhone: cust.phone,
      address: cust.address,
      isCustomCustomer: false
    }));
    setCustomerSearchQuery(cust.name);
    setShowCustomerDropdown(false);
  };

  const enableCustomCustomer = () => {
    setAddForm(prev => ({
      ...prev,
      customerName: "",
      customerPhone: "",
      address: "",
      isCustomCustomer: true
    }));
    setCustomerSearchQuery("");
    setShowCustomerDropdown(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone.includes(customerSearchQuery)
  );

  /* --------------- Statistics Computations --------------- */
  const totalCount = amcData.length;
  const activeCount = amcData.filter(item => item.status === "Active").length;
  const expiringCount = amcData.filter(item => item.status === "Expiring Soon").length;
  const expiredCount = amcData.filter(item => item.status === "Expired").length;
  const pendingPaymentCount = amcData.filter(item => item.payment === "Pending").length;

  /* --------------- Table Filter Client Logic --------------- */
  const filteredAmcs = amcData.filter(item => {
    const matchesSearch = 
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerPhone && item.customerPhone.includes(searchQuery)) ||
      item.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Plan Filter Match
    let matchesPlan = true;
    if (planFilter !== "All") {
      if (planFilter === "Basic") matchesPlan = item.plan.toLowerCase().includes("basic");
      else if (planFilter === "Standard") matchesPlan = item.plan.toLowerCase().includes("standard");
      else if (planFilter === "Premium") matchesPlan = item.plan.toLowerCase().includes("premium");
    }

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || item.payment === paymentFilter;

    return matchesSearch && matchesPlan && matchesStatus && matchesPayment;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-md w-full">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-xl shadow-xl border text-sm flex items-start gap-3 transition-all transform translate-y-0 duration-300 animate-slide-in ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : toast.type === 'info' ? 'bg-blue-50 text-blue-800 border-blue-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            : toast.type === 'info' ? <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
            : <Info className="w-5 h-5 text-amber-500 shrink-0" />}
            <p className="font-semibold flex-1">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* ── HEADER ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-[#2563EB]" />
            AMC Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track Annual Maintenance Contracts, renewals, and expiration schedules.</p>
        </div>
        <button 
          onClick={() => {
            setAddForm(prev => ({
              ...prev,
              startDate: new Date().toISOString().split("T")[0],
              endDate: calculateEndDate(new Date().toISOString().split("T")[0], amcPlans[0]?.name || "Basic 1-Year AMC"),
              plan: amcPlans[0]?.name || "Basic 1-Year AMC"
            }));
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-blue-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add New AMC
        </button>
      </div>

      {/* ── METRICS STATISTICS ROW ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total contracts</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0 border border-blue-100">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          {/* Card 2: Active */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active contracts</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1.5">{activeCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          {/* Card 3: Expiring Soon */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiring Soon</p>
              <h3 className="text-2xl font-black text-amber-500 mt-1.5">{expiringCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          {/* Card 4: Expired */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expired</p>
              <h3 className="text-2xl font-black text-rose-500 mt-1.5">{expiredCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          {/* Card 5: Pending Payments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending payment</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1.5">{pendingPaymentCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR CARD ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by customer name, plan, or contract ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all outline-none"
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Plan:</span>
            <select 
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none border-none cursor-pointer pr-1"
            >
              <option value="All">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none border-none cursor-pointer pr-1"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Payment:</span>
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none border-none cursor-pointer pr-1"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DATA GRID TABLE ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-medium">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#2563EB] animate-spin mx-auto mb-3" />
          Loading AMC contract registry...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse lg:min-w-0 min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest lg:w-auto w-[240px] min-w-[200px]">Customer / Location</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest lg:min-w-0 min-w-[140px]">Plan Details</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest lg:min-w-0 min-w-[150px]">Contract Period</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest lg:min-w-0 min-w-[90px]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest lg:min-w-0 min-w-[90px]">Payment</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right pr-8 lg:min-w-0 min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAmcs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.customerName} />
                        <div>
                          {item.customerPhone ? (
                            <Link href={`/dashboard/customers/${encodeURIComponent(item.customerPhone)}`}>
                              <p className="text-sm font-bold text-slate-900 hover:text-[#2563EB] hover:underline transition-colors flex items-center gap-1.5">
                                {item.customerName}
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              </p>
                            </Link>
                          ) : (
                            <p className="text-sm font-bold text-slate-900">{item.customerName}</p>
                          )}
                          <div className="flex items-center gap-1 text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <p className="text-xs font-semibold max-w-[220px] truncate">{item.address}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{item.plan}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider uppercase">{item.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-start gap-2.5 text-slate-600">
                        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{formatDate(item.startDate)}</span>
                          <span className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">to {formatDate(item.endDate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4.5">
                      <button 
                        onClick={() => handleTogglePaymentStatus(item)}
                        className="hover:scale-105 active:scale-95 transition-transform"
                        title="Click to toggle payment status"
                      >
                        <PaymentBadge status={item.payment} />
                      </button>
                    </td>
                    <td className="px-6 py-4.5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedAmc(item); setIsViewModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => setInvoiceAmc(item)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                          title="View Invoice"
                        >
                          <FileText className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => openRenewal(item)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" 
                          title="Renew Contract"
                        >
                          <RefreshCw className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleSendReminder(item)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                          title="Send Renewal Reminder"
                        >
                          <Bell className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAmc(item.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                          title="Delete Contract"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAmcs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No AMC contracts found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing <span className="font-extrabold text-slate-900">{filteredAmcs.length}</span> of <span className="font-extrabold text-slate-900">{totalCount}</span> contracts
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         MODAL: ADD NEW AMC
         ═══════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#0B1B3D] px-6 py-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-white">
                <Shield className="w-5.5 h-5.5 text-blue-400" />
                <p className="font-black text-lg">Onboard New AMC Contract</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              
              {/* Customer Selection Block */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    Customer Lookup / Select
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (addForm.isCustomCustomer) {
                        setAddForm(prev => ({ ...prev, isCustomCustomer: false }));
                      } else {
                        enableCustomCustomer();
                      }
                    }}
                    className="text-xs font-extrabold text-[#2563EB] hover:underline"
                  >
                    {addForm.isCustomCustomer ? "Search Existing" : "Add New Customer Details"}
                  </button>
                </div>

                {!addForm.isCustomCustomer ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative" ref={customerDropdownRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Search existing customer by name or phone..."
                          value={customerSearchQuery}
                          onChange={(e) => {
                            setCustomerSearchQuery(e.target.value);
                            setShowCustomerDropdown(true);
                            // Clear auto-fills if cleared
                            if (!e.target.value) {
                              setAddForm(prev => ({ ...prev, customerName: "", customerPhone: "", address: "" }));
                            }
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:bg-white focus:border-[#2563EB]"
                        />
                      </div>
                      {showCustomerDropdown && customerSearchQuery && (
                        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto">
                          {filteredCustomers.map(cust => (
                            <div 
                              key={cust.id}
                              onClick={() => selectCustomer(cust)}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-900">{cust.name}</p>
                                <p className="text-xs text-slate-500 font-semibold">{cust.phone}</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                Select
                              </span>
                            </div>
                          ))}
                          {filteredCustomers.length === 0 && (
                            <div className="px-4 py-3 text-center text-xs text-slate-400 font-bold">
                              No customers found. 
                              <button 
                                type="button" 
                                onClick={enableCustomCustomer}
                                className="text-[#2563EB] ml-1 underline"
                              >
                                Add manual entry
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Customer Card */}
                    {addForm.customerName && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between animate-slide-in">
                        <div>
                          <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Selected Existing Customer</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{addForm.customerName}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">Ph: {addForm.customerPhone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAddForm(prev => ({ ...prev, customerName: "", customerPhone: "", address: "" }));
                            setCustomerSearchQuery("");
                          }}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Manual Unregistered Entry</span>
                      <button 
                        type="button" 
                        onClick={() => setAddForm(prev => ({ ...prev, isCustomCustomer: false }))} 
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Reset Search
                      </button>
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Customer Full Name" 
                        value={addForm.customerName}
                        onChange={(e) => setAddForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Customer Mobile Number (e.g. +91 98765 43210)" 
                        value={addForm.customerPhone}
                        onChange={(e) => setAddForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Installation / Contract Address
                </label>
                <textarea 
                  rows={2}
                  placeholder="Street name, Sector, City..."
                  value={addForm.address}
                  onChange={(e) => setAddForm(prev => ({ ...prev, address: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>

              {/* Plan Choice */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Select AMC Plan
                </label>
                <select
                  value={addForm.plan}
                  onChange={(e) => handleAddPlanChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                >
                  <option value="" disabled>-- Select plan --</option>
                  {amcPlans.map(plan => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name} - ₹{plan.price.toLocaleString("en-IN")}
                    </option>
                  ))}
                  {/* Fallbacks if db seed plans are empty */}
                  {amcPlans.length === 0 && (
                    <>
                      <option value="Basic 1-Year AMC">Basic 1-Year AMC (₹1500)</option>
                      <option value="Premium 1-Year AMC">Premium 1-Year AMC (₹2500)</option>
                      <option value="Standard 2-Year AMC">Standard 2-Year AMC (₹3000)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Start Date
                  </label>
                  <input 
                    type="date"
                    value={addForm.startDate}
                    onChange={(e) => handleAddStartDateChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                    End Date (Auto)
                  </label>
                  <input 
                    type="date"
                    value={addForm.endDate}
                    onChange={(e) => setAddForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    Payment Status
                  </label>
                  <div className="flex gap-2">
                    {["Paid", "Pending"].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, payment: status }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          addForm.payment === status
                            ? status === "Paid" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-rose-50 border-rose-500 text-rose-700"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    Custom Contract ID (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. AMC-5091" 
                    value={addForm.id}
                    onChange={(e) => setAddForm(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Conditional Amount Paid for Pending Payment */}
              {addForm.payment === "Pending" && (
                <div className="grid grid-cols-2 gap-4 mt-2 bg-rose-50/55 p-4 border border-rose-100 rounded-2xl animate-slide-in">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Amount Paid So Far (₹)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max={getPlanPrice(addForm.plan)}
                      placeholder="0"
                      value={addForm.amountPaid}
                      onChange={(e) => setAddForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Remaining Balance (Due)
                    </span>
                    <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black text-rose-600">
                      ₹{(getPlanPrice(addForm.plan) - Number(addForm.amountPaid || 0)).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  {submitting && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
                  {submitting ? "Onboarding..." : "Confirm & Save Contract"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         MODAL: VIEW DETAILS
         ═══════════════════════════════════════════════════ */}
      {isViewModalOpen && selectedAmc && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#0B1B3D] px-6 py-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-blue-400" />
                <p className="font-bold">AMC Contract Details</p>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-5">
              
              {/* Customer Details */}
              <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4.5">
                <Avatar name={selectedAmc.customerName} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate">
                    {selectedAmc.customerName}
                  </h3>
                  {selectedAmc.customerPhone && (
                    <div className="flex items-center gap-1.5 text-slate-500 mt-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold">{selectedAmc.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5 text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold leading-relaxed">{selectedAmc.address}</span>
                  </div>
                </div>
              </div>

              {/* Plan Details Card */}
              <div className="bg-[#0B1B3D]/5 border border-[#0B1B3D]/10 rounded-xl p-4.5 flex flex-col gap-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Plan</span>
                    <p className="font-extrabold text-slate-900 text-base mt-0.5">{selectedAmc.plan}</p>
                  </div>
                  <span className="text-xs font-black text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg tracking-wider">
                    {selectedAmc.id}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Start Date</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{formatDate(selectedAmc.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expiration Date</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{formatDate(selectedAmc.endDate)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <div className="mt-1"><StatusBadge status={selectedAmc.status} /></div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Payment status</span>
                    <div className="mt-1">
                      <button onClick={() => handleTogglePaymentStatus(selectedAmc)}>
                        <PaymentBadge status={selectedAmc.payment} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col gap-2.5 mt-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSendReminder(selectedAmc)}
                    className="flex-1 py-3 bg-[#0B1B3D] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bell className="w-4 h-4" /> Send Reminder
                  </button>
                  <button 
                    onClick={() => openRenewal(selectedAmc)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Renew Contract
                  </button>
                </div>
                
                <button 
                  onClick={() => { setInvoiceAmc(selectedAmc); setIsViewModalOpen(false); }}
                  className="w-full py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-500" /> View Contract Invoice
                </button>

                {selectedAmc.customerPhone && (
                  <Link href={`/dashboard/customers/${encodeURIComponent(selectedAmc.customerPhone)}`} className="w-full">
                    <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200">
                      <User className="w-4 h-4 text-slate-500" /> View Customer Profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                )}

                <button 
                  onClick={() => handleDeleteAmc(selectedAmc.id)}
                  className="w-full py-2.5 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" /> Delete Contract
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         MODAL: RENEW CONTRACT
         ═══════════════════════════════════════════════════ */}
      {isRenewModalOpen && selectedAmc && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#0B1B3D] px-6 py-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-white">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                <p className="font-bold">Renew AMC Contract</p>
              </div>
              <button 
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleRenewSubmit} className="p-6 flex flex-col gap-4">
              
              {/* Alert Indicator */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-800">New Contract Creation</h4>
                  <p className="text-[11px] font-medium text-emerald-700 mt-0.5 leading-relaxed">
                    This will create a fresh contract record for <strong className="font-bold">{selectedAmc.customerName}</strong>. 
                    The old contract will be preserved in the archive logs as Expired.
                  </p>
                </div>
              </div>

              {/* Plan Choice */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Select Renewal Plan
                </label>
                <select
                  value={renewForm.plan}
                  onChange={(e) => handleRenewPlanChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                >
                  {amcPlans.map(plan => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name} - ₹{plan.price.toLocaleString("en-IN")}
                    </option>
                  ))}
                  {amcPlans.length === 0 && (
                    <>
                      <option value="Basic 1-Year AMC">Basic 1-Year AMC (₹1500)</option>
                      <option value="Premium 1-Year AMC">Premium 1-Year AMC (₹2500)</option>
                      <option value="Standard 2-Year AMC">Standard 2-Year AMC (₹3000)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Start Date
                  </label>
                  <input 
                    type="date"
                    value={renewForm.startDate}
                    onChange={(e) => handleRenewStartDateChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Expiration Date
                  </label>
                  <input 
                    type="date"
                    value={renewForm.endDate}
                    onChange={(e) => setRenewForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                  Payment Status
                </label>
                <div className="flex gap-2">
                  {["Paid", "Pending"].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRenewForm(prev => ({ ...prev, payment: status }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        renewForm.payment === status
                          ? status === "Paid" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-rose-50 border-rose-500 text-rose-700"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Amount Paid for Pending Payment */}
              {renewForm.payment === "Pending" && (
                <div className="grid grid-cols-2 gap-4 mt-2 bg-rose-50/55 p-4 border border-rose-100 rounded-2xl animate-slide-in">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Amount Paid So Far (₹)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max={getPlanPrice(renewForm.plan)}
                      placeholder="0"
                      value={renewForm.amountPaid}
                      onChange={(e) => setRenewForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Remaining Balance (Due)
                    </span>
                    <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black text-rose-600">
                      ₹{(getPlanPrice(renewForm.plan) - Number(renewForm.amountPaid || 0)).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  {submitting && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
                  {submitting ? "Saving..." : "Confirm Renewal"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {paymentAmc && (
        <AmcPaymentModal 
          amc={paymentAmc} 
          onClose={() => setPaymentAmc(null)} 
          onUpdate={fetchAMCs} 
        />
      )}
      {invoiceAmc && (
        <AmcInvoiceView 
          amc={invoiceAmc} 
          onClose={() => setInvoiceAmc(null)} 
          onUpdate={fetchAMCs} 
        />
      )}
    </div>
  );
}
