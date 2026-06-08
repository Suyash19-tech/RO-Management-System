"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import { CheckCircle2, Receipt, AlertCircle, Trash2, Calendar, ShoppingBag, Check } from "lucide-react";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  vendor: string | null;
  loggedBy: string;
  productId: string | null;
  productName: string | null;
  quantity: number | null;
}

interface ExpensesTableProps {
  expenses: Expense[];
  onRefresh: () => void;
  search: string;
  filterCategory: string;
  filterStatus: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Partially Paid": "bg-amber-50 text-amber-700 border-amber-100",
    Unpaid: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase border ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}

export function ExpensesTable({ expenses, onRefresh, search, filterCategory, filterStatus }: ExpensesTableProps) {
  const [settleExpense, setSettleExpense] = useState<Expense | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSettleClick = (expense: Expense) => {
    setSettleExpense(expense);
    setSettleAmount(expense.balanceDue.toString());
    setError("");
  };

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleExpense) return;

    const payVal = parseFloat(settleAmount) || 0;
    if (payVal <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (payVal > settleExpense.balanceDue) {
      setError(`Payment cannot exceed the balance due of ₹${settleExpense.balanceDue}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newTotalPaid = settleExpense.amountPaid + payVal;
      const res = await fetch(`/api/expenses/${settleExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: newTotalPaid }),
      });

      if (!res.ok) {
        throw new Error("Failed to settle payment");
      }

      onRefresh();
      setSettleExpense(null);
    } catch (err: any) {
      setError(err.message || "Failed to save payment settlement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record? This will not revert inventory stock changes.")) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete expense");
      }

      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    }
  };

  // Filter local copy based on props
  const filteredExpenses = expenses.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.id.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.vendor && item.vendor.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);

    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Expense ID & Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category & Vendor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Money Given</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance Due</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredExpenses.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                {/* ID & Date */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">EXP-{item.id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-350" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                </td>
                
                {/* Category & Vendor */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      {item.category === "Inventory Purchase" && <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mt-1">
                      {item.vendor || "N/A"}
                    </span>
                  </div>
                </td>
                
                {/* Description */}
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-slate-650 max-w-[280px] truncate" title={item.description}>
                    {item.description}
                  </div>
                </td>
                
                {/* Total Cost */}
                <td className="px-6 py-5 text-right">
                  <span className="text-sm font-bold text-slate-900">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </span>
                </td>
                
                {/* Money Given */}
                <td className="px-6 py-5 text-right">
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50/60 border border-emerald-100/40 px-2 py-0.5 rounded-lg inline-block">
                    ₹{item.amountPaid.toLocaleString("en-IN")}
                  </span>
                </td>
                
                {/* Balance Due */}
                <td className="px-6 py-5 text-right">
                  {item.balanceDue > 0 ? (
                    <span className="text-sm font-bold text-rose-600 bg-rose-50/60 border border-rose-100/40 px-2 py-0.5 rounded-lg inline-block">
                      ₹{item.balanceDue.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-400">₹0</span>
                  )}
                </td>
                
                {/* Status */}
                <td className="px-6 py-5 text-center">
                  <StatusBadge status={item.status} />
                </td>
                
                {/* Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {item.balanceDue > 0 && (
                      <button
                        onClick={() => handleSettleClick(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/10 hover:shadow-md active:scale-95 cursor-pointer"
                      >
                        Settle Pay
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Receipt className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-base font-bold text-slate-500">No expenses found</p>
                    <p className="text-sm font-medium text-slate-400">
                      {search || filterCategory !== "All" || filterStatus !== "All"
                        ? "Try clearing your filters or search query"
                        : "Click 'Log Expense' to create your first expense entry"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Settle Payment Modal */}
      {settleExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.4)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-100 max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900">Settle Outstanding Payment</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Update payment to supplier / vendor
                </p>
              </div>
              <button
                onClick={() => setSettleExpense(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Vendor / Supplier</span>
                  <span className="font-bold text-slate-900">{settleExpense.vendor || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Description</span>
                  <span className="font-bold text-slate-750 truncate max-w-[200px]">{settleExpense.description}</span>
                </div>
                <div className="border-t border-slate-205 my-2 pt-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-semibold">Total Cost</span>
                  <span className="font-black text-slate-950">₹{settleExpense.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-semibold">Paid So Far</span>
                  <span className="font-black text-emerald-600">₹{settleExpense.amountPaid.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-semibold">Remaining Due</span>
                  <span className="font-black text-rose-600">₹{settleExpense.balanceDue.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Amount Paying Now (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max={settleExpense.balanceDue}
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-950 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all outline-none"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleExpense(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  {submitting ? "Settling..." : "✓ Settle Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
