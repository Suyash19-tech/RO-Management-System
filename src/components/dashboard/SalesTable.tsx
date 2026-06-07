"use client";

import {
  TrendingUp, TrendingDown, Wallet, AlertCircle, Search,
  MapPin, Calendar, ChevronDown, X, Filter, Tag, IndianRupee,
  Wrench, Shield, Home, Package, ArrowUpRight, ArrowDownRight,
  ReceiptText, Clock, ExternalLink
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────── */
type EntryType = "Installation" | "Service" | "AMC";
type PayStatus = "Paid" | "Partial" | "Unpaid" | "Free";

type SaleEntry = {
  id: string;
  type: EntryType;
  customerName: string;
  customerPhone: string | null;
  address: string;
  description: string;
  subItems: string | null;
  date: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentMethod: string;
  paymentStatus: string;
  purchaseCost: number;
};

type Summary = {
  totalRevenue: number;
  totalCollected: number;
  totalDue: number;
  totalPurchaseCost: number;
  totalProfit: number;
  installationCount: number;
  serviceCount: number;
  amcCount: number;
};

/* ─── Helpers ───────────────────────────────────────── */
const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

function Avatar({ name }: { name: string }) {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700",
    "bg-teal-100 text-teal-700", "bg-indigo-100 text-indigo-700",
  ];
  const c = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${c}`}>
      {initials}
    </div>
  );
}

function TypeBadge({ type }: { type: EntryType }) {
  const cfg: Record<EntryType, { cls: string; Icon: any }> = {
    Installation: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Home },
    Service:      { cls: "bg-violet-50 text-violet-700 border-violet-200", Icon: Wrench },
    AMC:          { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: Shield },
  };
  const { cls, Icon } = cfg[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      <Icon className="w-3 h-3" /> {type}
    </span>
  );
}

function PayBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    Paid:    "bg-emerald-100 text-emerald-700",
    Partial: "bg-amber-100 text-amber-700",
    Unpaid:  "bg-rose-100 text-rose-700",
    Free:    "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${cfg[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

/* ─── Summary Card ──────────────────────────────────── */
function SummaryCard({
  label, value, sub, icon: Icon, color, trend
}: {
  label: string; value: string; sub?: string;
  icon: any; color: string; trend?: "up" | "down";
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
      <div className="flex items-start sm:items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight truncate">{label}</span>
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-lg sm:text-2xl font-black text-slate-900 truncate">{value}</p>
        {sub && (
          <p className={`text-[10px] sm:text-xs font-semibold mt-1 flex items-start sm:items-center gap-1 truncate ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-500" : "text-slate-400"}`}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3 shrink-0" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3 shrink-0" />}
            <span className="truncate">{sub}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════ */
export function SalesTable() {
  const [entries, setEntries] = useState<SaleEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Settle Payment Modal & Notification States
  const [selectedSettle, setSelectedSettle] = useState<SaleEntry | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [settleConfirm, setSettleConfirm] = useState<boolean>(false);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EntryType>("all");
  const [payFilter, setPayFilter] = useState<"all" | string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/sales")
      .then(r => r.json())
      .then(d => {
        setEntries(d.entries || []);
        setSummary(d.summary || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettle) return;

    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (amt > selectedSettle.amountDue) {
      setError(`Settle amount cannot exceed the balance due of ${fmt(selectedSettle.amountDue)}.`);
      return;
    }

    if (!settleConfirm) {
      setError("Please check the confirmation box to verify this payment settlement.");
      return;
    }

    setSettling(true);
    setError(null);

    try {
      const res = await fetch("/api/sales/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSettle.id,
          type: selectedSettle.type,
          amount: amt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to settle payment");
      }

      setToast({
        type: "success",
        message: `Successfully settled ₹${amt.toLocaleString("en-IN")} for ${selectedSettle.customerName}'s ${selectedSettle.type}!`,
      });
      setSelectedSettle(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSettling(false);
    }
  };

  // Derived filtered list
  const filtered = useMemo(() => {
    return entries.filter(e => {
      // search
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.customerName.toLowerCase().includes(q) &&
          !e.description.toLowerCase().includes(q) &&
          !(e.customerPhone ?? "").includes(q) &&
          !e.address.toLowerCase().includes(q)
        ) return false;
      }
      // type
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      // payment
      if (payFilter !== "all" && e.paymentStatus !== payFilter) return false;
      // date range
      if (dateFrom && new Date(e.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(e.date) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [entries, search, typeFilter, payFilter, dateFrom, dateTo]);

  // Filtered summary
  const filtSummary = useMemo(() => ({
    revenue: filtered.reduce((s, e) => s + e.totalAmount, 0),
    collected: filtered.reduce((s, e) => s + e.amountPaid, 0),
    due: filtered.reduce((s, e) => s + e.amountDue, 0),
  }), [filtered]);

  const hasFilters = typeFilter !== "all" || payFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setTypeFilter("all"); setPayFilter("all");
    setDateFrom(""); setDateTo("");
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {/* skeleton cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-pulse h-48" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <SummaryCard
          label="Total Revenue"
          value={fmt(filtSummary.revenue)}
          sub={`From ${filtered.length} transactions`}
          icon={TrendingUp}
          color="bg-blue-100 text-blue-600"
          trend="up"
        />
        <SummaryCard
          label="Collected"
          value={fmt(filtSummary.collected)}
          sub="Money received"
          icon={Wallet}
          color="bg-emerald-100 text-emerald-600"
          trend="up"
        />
        <SummaryCard
          label="Outstanding Dues"
          value={fmt(filtSummary.due)}
          sub={`${filtered.filter(e => e.amountDue > 0).length} clients pending`}
          icon={AlertCircle}
          color="bg-rose-100 text-rose-500"
          trend={filtSummary.due > 0 ? "down" : undefined}
        />
        <SummaryCard
          label="Net Profit"
          value={summary ? fmt(summary.totalProfit) : "—"}
          sub="Collected - Purchase cost"
          icon={IndianRupee}
          color="bg-violet-100 text-violet-600"
          trend="up"
        />
      </div>

      {/* ── Type Breakdown Strip ── */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Installations", count: summary.installationCount, type: "Installation" as EntryType, cls: "border-blue-200 bg-blue-50 text-blue-700", Icon: Home },
            { label: "Services", count: summary.serviceCount, type: "Service" as EntryType, cls: "border-violet-200 bg-violet-50 text-violet-700", Icon: Wrench },
            { label: "AMC Plans", count: summary.amcCount, type: "AMC" as EntryType, cls: "border-emerald-200 bg-emerald-50 text-emerald-700", Icon: Shield },
          ].map(({ label, count, type, cls, Icon }) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all font-bold text-sm ${
                typeFilter === type
                  ? cls + " shadow-sm scale-[0.98]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${typeFilter === type ? "bg-white/60" : "bg-slate-100"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Controls ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Search + Filter toggle row */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, service..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all shrink-0 ${
              showFilters || hasFilters
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-black flex items-center justify-center">!</span>}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 flex-wrap">
            {/* Payment filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Status</label>
              <div className="flex gap-1 flex-wrap">
                {(["all", "Paid", "Partial", "Unpaid", "Free"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPayFilter(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      payFilter === p
                        ? p === "Paid" ? "bg-emerald-600 text-white"
                        : p === "Partial" ? "bg-amber-500 text-white"
                        : p === "Unpaid" ? "bg-rose-600 text-white"
                        : p === "Free" ? "bg-slate-600 text-white"
                        : "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date Range
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-400"
                />
                <span className="text-slate-400 text-xs font-bold">→</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {hasFilters && (
              <div className="flex items-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pay filter quick tabs — large, touch-friendly */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 py-3 border-b border-slate-100 overflow-x-auto">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {(["all", "Paid", "Partial", "Unpaid"] as const).map(f => {
              const count = f === "all" ? filtered.length : filtered.filter(e => e.paymentStatus === f).length;
              const activeColor = f === "Paid" ? "bg-emerald-600 text-white shadow-emerald-200"
                : f === "Partial" ? "bg-amber-500 text-white shadow-amber-200"
                : f === "Unpaid" ? "bg-rose-600 text-white shadow-rose-200"
                : "bg-slate-900 text-white shadow-slate-300";
              return (
                <button
                  key={f}
                  onClick={() => setPayFilter(f)}
                  className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all shrink-0 min-w-0 sm:min-w-[100px] flex items-center justify-center gap-1.5 sm:gap-2 ${
                    payFilter === f
                      ? `${activeColor} shadow-md scale-[0.97]`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
                  }`}
                >
                  {f === "all" ? "All" : f}
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${
                    payFilter === f ? "bg-white/25" : "bg-slate-200/80"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="shrink-0 text-xs font-semibold text-slate-400 text-right sm:text-left">
            Showing <span className="font-black text-slate-800">{filtered.length}</span> records
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center gap-3">
              <ReceiptText className="w-12 h-12 text-slate-200" />
              <p className="font-bold text-slate-500">No transactions found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Collected</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Due</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* Customer — clickable to profile */}
                    <td className="px-5 py-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group/cust"
                        onClick={() => {
                          if (entry.customerPhone) {
                            router.push(`/dashboard/customers/${encodeURIComponent(entry.customerPhone)}`);
                          }
                        }}
                        title={entry.customerPhone ? "View customer profile" : undefined}
                      >
                        <Avatar name={entry.customerName} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate group-hover/cust:text-blue-600 transition-colors flex items-center gap-1.5">
                            {entry.customerName}
                            {entry.customerPhone && <ExternalLink className="w-3 h-3 text-slate-300 group-hover/cust:text-blue-500 transition-colors shrink-0" />}
                          </p>
                          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <p className="text-xs font-medium truncate max-w-[160px]">{entry.address}</p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Transaction */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <TypeBadge type={entry.type} />
                        <p className="text-sm font-bold text-slate-900">{entry.description}</p>
                        {entry.subItems && (
                          <p className="text-xs font-medium text-slate-400 flex items-center gap-1 max-w-[200px]">
                            <Package className="w-3 h-3 shrink-0" />
                            <span className="truncate">{entry.subItems}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-slate-700">{fmtDate(entry.date)}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {entry.paymentMethod}
                        </p>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-black text-slate-900">{fmt(entry.totalAmount)}</span>
                    </td>

                    {/* Collected */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-700">{fmt(entry.amountPaid)}</span>
                    </td>

                    {/* Due */}
                    <td className="px-5 py-4 text-right">
                      {entry.amountDue > 0 ? (
                        <span className="text-sm font-black text-rose-600">{fmt(entry.amountDue)}</span>
                      ) : (
                        <span className="text-sm font-medium text-slate-300">—</span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-4">
                      <PayBadge status={entry.paymentStatus} />
                    </td>

                    {/* Actions cell */}
                    <td className="px-5 py-4 text-center">
                      {entry.amountDue > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedSettle(entry);
                            setSettleAmount(entry.amountDue.toString());
                            setSettleConfirm(false);
                            setError(null);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm shadow-emerald-600/10 active:scale-95 mx-auto"
                        >
                          Settle
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer: Filtered Totals ── */}
        {filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500">
              <span className="font-black text-slate-800">{filtered.length}</span> transactions shown
            </span>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Revenue:</span>
                <span className="font-black text-slate-900">{fmt(filtSummary.revenue)}</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Collected:</span>
                <span className="font-black text-emerald-700">{fmt(filtSummary.collected)}</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Pending:</span>
                <span className={`font-black ${filtSummary.due > 0 ? "text-rose-600" : "text-slate-400"}`}>
                  {fmt(filtSummary.due)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce shadow-2xl flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold bg-white text-slate-800 border-slate-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            toast.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
          }`}>
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Settle Payment Modal */}
      {selectedSettle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Settle Outstanding Payment</h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Ref ID: {selectedSettle.id}</p>
              </div>
              <button 
                onClick={() => setSelectedSettle(null)} 
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-6 flex flex-col gap-5">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Transaction Context Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Customer</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">{selectedSettle.customerName}</h4>
                    {selectedSettle.customerPhone && (
                      <p className="text-xs font-semibold text-slate-500">{selectedSettle.customerPhone}</p>
                    )}
                  </div>
                  <TypeBadge type={selectedSettle.type} />
                </div>
                <div className="h-px bg-slate-200" />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Price</span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{fmt(selectedSettle.totalAmount)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Paid so far</span>
                    <p className="font-bold text-emerald-600 text-sm mt-0.5">{fmt(selectedSettle.amountPaid)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Balance Due</span>
                    <p className="font-black text-rose-600 text-sm mt-0.5">{fmt(selectedSettle.amountDue)}</p>
                  </div>
                </div>
              </div>

              {/* Input settle amount */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Amount to Settle (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="font-bold text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-base font-black outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
                    placeholder="Enter amount"
                    min="0.01"
                    max={selectedSettle.amountDue}
                  />
                </div>
                <p className="text-slate-400 text-[11px] font-medium mt-1">
                  Enter payment received. Max settleable amount is {fmt(selectedSettle.amountDue)}.
                </p>
              </div>

              {/* Confirmation checkbox */}
              <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                <input
                  type="checkbox"
                  id="confirm-settlement"
                  checked={settleConfirm}
                  onChange={(e) => setSettleConfirm(e.target.checked)}
                  className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <label htmlFor="confirm-settlement" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  I confirm that I have received ₹{parseFloat(settleAmount || "0").toLocaleString("en-IN")} from this customer and wish to settle the outstanding balance. This will update the user profile and analytics.
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSettle(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settling}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/10 flex items-center gap-1.5"
                >
                  {settling ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Settling...
                    </>
                  ) : (
                    "Confirm Settlement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
