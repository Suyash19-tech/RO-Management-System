"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, RefreshCw, DollarSign, Receipt, AlertCircle, ShoppingBag, Landmark, Users } from "lucide-react";
import { ExpensesTable } from "@/components/dashboard/ExpensesTable";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  purchasePrice: number;
  stock: number;
}

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

const EXPENSE_CATEGORIES = [
  "Inventory Purchase",
  "Fuel & Travel",
  "Salary",
  "Rent / Utilities",
  "Marketing",
  "Other"
];

function StatCard({ icon, label, value, subtext, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Log Expense Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form Fields State
  const [category, setCategory] = useState("Inventory Purchase");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Inventory purchase specific states
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("0");

  const fetchExpensesAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [expRes, prodRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/products")
      ]);

      if (!expRes.ok || !prodRes.ok) {
        throw new Error("Failed to load records");
      }

      const expData = await expRes.json();
      const prodData = await prodRes.json();

      setExpenses(expData);
      setProducts(prodData.filter((p: any) => p.category !== "AMC Plan"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpensesAndProducts();
  }, [fetchExpensesAndProducts]);

  // Automatically compute fields for Inventory Purchase
  useEffect(() => {
    if (category === "Inventory Purchase" && selectedProductId) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        const qtyVal = parseInt(quantity) || 0;
        const uCostVal = parseFloat(unitCost) || prod.purchasePrice || 0;
        
        // Auto calculate total amount
        const computedAmount = qtyVal * uCostVal;
        setAmount(computedAmount.toString());

        // Prefill description if empty or system generated
        const autoDesc = `Purchased ${qtyVal} units of ${prod.name}`;
        if (!description || description.startsWith("Purchased")) {
          setDescription(autoDesc);
        }
      }
    }
  }, [category, selectedProductId, quantity, unitCost, products, description]);

  // Auto prefill single unit cost when product selection changes
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setUnitCost(prod.purchasePrice.toString());
    }
  };

  const handleOpenLogModal = () => {
    // Reset form fields
    setCategory("Inventory Purchase");
    setDescription("");
    setAmount("");
    setAmountPaid("");
    setVendor("");
    setDate(new Date().toISOString().split("T")[0]);
    setSelectedProductId(products[0]?.id || "");
    setQuantity("10");
    if (products[0]) {
      setUnitCost(products[0].purchasePrice.toString());
    } else {
      setUnitCost("0");
    }
    setModalError("");
    setShowLogModal(true);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    const totalVal = parseFloat(amount) || 0;
    const paidVal = parseFloat(amountPaid) || 0;

    if (totalVal <= 0) {
      setModalError("Please enter a valid expense total amount");
      setSubmitting(false);
      return;
    }

    if (paidVal < 0) {
      setModalError("Money given cannot be negative");
      setSubmitting(false);
      return;
    }

    if (paidVal > totalVal) {
      setModalError("Money given cannot exceed the total amount");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, any> = {
      category,
      description,
      amount: totalVal,
      amountPaid: paidVal,
      vendor: vendor || null,
      date: new Date(date).toISOString(),
    };

    if (category === "Inventory Purchase") {
      payload.productId = selectedProductId || null;
      payload.quantity = parseInt(quantity) || null;
    }

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to log expense record");
      }

      await fetchExpensesAndProducts();
      setShowLogModal(false);
    } catch (error: any) {
      setModalError(error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute Statistics
  const totalOutflow = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalGiven = expenses.reduce((sum, item) => sum + item.amountPaid, 0);
  const outstandingDue = expenses.reduce((sum, item) => sum + item.balanceDue, 0);
  const inventoryPurchases = expenses
    .filter(item => item.category === "Inventory Purchase")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expenses & Purchasing</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track business cash outflows, inventory purchasing, vendor balances, and operational costs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchExpensesAndProducts}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleOpenLogModal}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Log Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-slate-600" />}
          label="Total Expenses"
          value={`₹${totalOutflow.toLocaleString("en-IN")}`}
          subtext="Total booked cash outflows"
          color="bg-slate-100"
        />
        <StatCard
          icon={<Landmark className="w-6 h-6 text-emerald-600" />}
          label="Total Money Given"
          value={`₹${totalGiven.toLocaleString("en-IN")}`}
          subtext="Actual cash paid out"
          color="bg-emerald-50"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6 text-rose-600" />}
          label="Outstanding Due"
          value={`₹${outstandingDue.toLocaleString("en-IN")}`}
          subtext="Unsettled balance to suppliers"
          color="bg-rose-50"
        />
        <StatCard
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          label="Inventory Purchases"
          value={`₹${inventoryPurchases.toLocaleString("en-IN")}`}
          subtext="Stock purchase expenditures"
          color="bg-blue-50"
        />
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by vendor, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading expenses log...</p>
          </div>
        ) : (
          <ExpensesTable
            expenses={expenses}
            onRefresh={fetchExpensesAndProducts}
            search={search}
            filterCategory={filterCategory}
            filterStatus={filterStatus}
          />
        )}
      </div>

      {/* Log Expense Modal */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.5)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-100 max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900">Log Business Expense</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Record operational costs and update inventory stock
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== "Inventory Purchase") {
                      setSelectedProductId("");
                      setQuantity("");
                      setUnitCost("");
                      setAmount("");
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                >
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Dynamic Inventory Purchase Section */}
              {category === "Inventory Purchase" && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Inventory Restocking Details</p>
                  
                  {/* Product Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Select Product to Restock
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku || "N/A"} · Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Quantity */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Quantity Purchased
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500"
                        placeholder="e.g. 10"
                        required
                      />
                    </div>

                    {/* Unit Purchase Cost */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Cost Per Unit (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500"
                        placeholder="e.g. 500"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-600 font-semibold italic">
                    * Logging this will automatically add {quantity || "0"} units to the stock level of the selected product.
                  </p>
                </div>
              )}

              {/* Vendor & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. AquaTech Suppliers"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Description / Remarks
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details of this expense"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Amounts block */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Cost */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Total Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={category === "Inventory Purchase" && !!selectedProductId}
                      className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold disabled:bg-slate-100 disabled:text-slate-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Money Given (Amount Paid) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Total Money Given (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter amount paid"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Balance Due indicator */}
              {amount && amountPaid && (
                <div className={`p-3.5 rounded-xl border text-sm font-bold flex justify-between items-center ${
                  parseFloat(amount) - parseFloat(amountPaid) > 0
                    ? "bg-amber-50 border-amber-100 text-amber-800"
                    : "bg-emerald-50 border-emerald-100 text-emerald-800"
                }`}>
                  <span>Balance Outstanding:</span>
                  <span>
                    ₹{(Math.max(0, parseFloat(amount) - parseFloat(amountPaid))).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {modalError}
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                >
                  {submitting ? "Saving..." : "✓ Log Expense"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
