"use client";

import {
  Package, Search, AlertTriangle, CheckCircle, XCircle,
  Edit2, RefreshCw, X, Plus, Minus, IndianRupee, Layers,
  Home, Building2, Wrench, Cpu, Droplet, ShieldCheck, Box
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  purchasePrice: number;
  stock: number;
  threshold: number;
  image: string | null;
  status: string;
};

const DEFAULT_CATEGORIES = [
  { label: "Domestic RO", icon: Home },
  { label: "Commercial RO", icon: Building2 },
  { label: "Accessories", icon: Wrench },
  { label: "Spare Parts", icon: Cpu },
  { label: "Filters", icon: Droplet },
  { label: "Membranes", icon: Layers },
  { label: "AMC Plan", icon: ShieldCheck },
];

function getCatIcon(cat: string) {
  return DEFAULT_CATEGORIES.find(c => c.label === cat)?.icon ?? Box;
}

function stockStatus(p: Product): "out" | "low" | "ok" {
  if (p.category === "AMC Plan") return "ok";
  if (p.stock === 0) return "out";
  if (p.stock <= (p.threshold ?? 5)) return "low";
  return "ok";
}

// --- Stock Status Badge ------------------------------------------------------
function StockBadge({ product }: { product: Product }) {
  const status = stockStatus(product);
  if (product.category === "AMC Plan") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
      <ShieldCheck className="w-3 h-3" /> Service
    </span>
  );
  if (status === "out") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
      <XCircle className="w-3 h-3" /> Out of Stock
    </span>
  );
  if (status === "low") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
      <AlertTriangle className="w-3 h-3" /> Low Stock
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <CheckCircle className="w-3 h-3" /> In Stock
    </span>
  );
}

// --- Stat Card ----------------------------------------------------------------
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// --- Stock Adjust Modal -------------------------------------------------------
function StockAdjustModal({ product, onClose, onUpdated }: {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [newStock, setNewStock] = useState(product.stock);
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const diff = newStock - product.stock;

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      onUpdated();
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
      setStep("edit");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-black text-slate-900">Adjust Stock</h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5 truncate max-w-[220px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === "edit" ? (
            <>
              {/* Current stock display */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Current Stock</span>
                <span className="text-xl font-black text-slate-900">{product.stock} units</span>
              </div>

              {/* +/- controls */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  New Stock Level
                </label>
                <div className="flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={() => setNewStock(Math.max(0, newStock - 1))}
                    className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-95 font-bold"
                  >
                    <Minus className="w-7 h-7" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={e => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 text-center px-4 py-3 border border-slate-200 rounded-2xl text-3xl font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStock(newStock + 1)}
                    className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-95 font-bold"
                  >
                    <Plus className="w-7 h-7" />
                  </button>
                </div>

                {/* Diff indicator */}
                {diff !== 0 && (
                  <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                    diff > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {diff > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    {diff > 0 ? `Adding ${diff} unit${diff !== 1 ? "s" : ""}` : `Removing ${Math.abs(diff)} unit${Math.abs(diff) !== 1 ? "s" : ""}`}
                  </div>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  disabled={newStock === product.stock}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-colors shadow-md shadow-blue-500/20"
                >
                  Review & Apply
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Summary of Changes</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Product</span>
                  <span className="text-sm font-bold text-slate-900">{product.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Before</span>
                  <span className="text-sm font-bold text-slate-700">{product.stock} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">After</span>
                  <span className={`text-sm font-black ${newStock < product.stock ? "text-rose-600" : "text-emerald-600"}`}>
                    {newStock} units
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-500">Change</span>
                  <span className={`text-base font-black ${diff > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {diff > 0 ? "+" : ""}{diff} units
                  </span>
                </div>
              </div>
              <p className="text-xs text-center font-semibold text-slate-500">
                Are you sure? This will update stock across the entire application.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep("edit")}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                  ← Go Back
                </button>
                <button onClick={handleConfirm} disabled={saving}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-colors shadow-md shadow-emerald-500/20">
                  {saving ? "Saving..." : "✓ Confirm"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Inventory Page -------------------------------------------------------
export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Low" | "Out">("All");
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Dynamic categories from DB
  const dynamicCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES.map(c => c.label),
    ...products.map(p => p.category),
  ]));

  // Stats
  const totalItems = products.length;
  const lowStockItems = products.filter(p => stockStatus(p) === "low");
  const outOfStockItems = products.filter(p => stockStatus(p) === "out");
  const totalUnits = products.reduce((s, p) => s + (p.category !== "AMC Plan" ? (p.stock || 0) : 0), 0);

  // Filter
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = filterCat === "All" || p.category === filterCat;
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Low" && stockStatus(p) === "low") ||
      (filterStatus === "Out" && stockStatus(p) === "out");
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Live stock levels for all products · {totalItems} items
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-5 h-5 text-blue-600" />} label="Total Products" value={totalItems} color="bg-blue-50" />
        <StatCard icon={<Layers className="w-5 h-5 text-slate-600" />} label="Total Units" value={totalUnits} color="bg-slate-100" />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} label="Low Stock" value={lowStockItems.length} color="bg-amber-50" />
        <StatCard icon={<XCircle className="w-5 h-5 text-rose-600" />} label="Out of Stock" value={outOfStockItems.length} color="bg-rose-50" />
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-amber-800">Low Stock Alert</p>
            <p className="text-xs font-medium text-amber-700 mt-0.5">
              {lowStockItems.map(p => p.name).join(", ")} — restock needed
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product name or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(["All", "Low", "Out"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                filterStatus === s
                  ? s === "Low" ? "bg-amber-600 text-white border-amber-600"
                    : s === "Out" ? "bg-rose-600 text-white border-rose-600"
                    : "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {s === "All" ? "All Status" : s === "Low" ? "⚠ Low Stock" : "✕ Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
        <button
          onClick={() => setFilterCat("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            filterCat === "All"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <Box className="w-3.5 h-3.5" /> All ({products.length})
        </button>
        {dynamicCategories.map(cat => {
          const CatIcon = getCatIcon(cat);
          const count = products.filter(p => p.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterCat === cat
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              {cat}
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md ml-1">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading inventory...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Purchase ₹</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Selling ₹</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Edit Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(item => {
                    const CatIcon = getCatIcon(item.category);
                    const st = stockStatus(item);
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${st === "out" ? "bg-rose-50/30" : st === "low" ? "bg-amber-50/30" : ""}`}>
                        {/* Product */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                : <Package className="w-4 h-4 text-slate-300" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-snug">{item.name}</p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                Alert below {item.threshold ?? 5} units
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <CatIcon className="w-3 h-3" /> {item.category}
                          </span>
                        </td>

                        {/* Stock count */}
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xl font-black ${
                            st === "out" ? "text-rose-600"
                            : st === "low" ? "text-amber-600"
                            : "text-slate-900"
                          }`}>
                            {item.category === "AMC Plan" ? "∞" : item.stock}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-3">
                          <StockBadge product={item} />
                        </td>

                        {/* Purchase price */}
                        <td className="px-5 py-3 text-sm font-semibold text-slate-600 whitespace-nowrap">
                          ₹{(item.purchasePrice || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Selling price */}
                        <td className="px-5 py-3 text-sm font-black text-slate-900 whitespace-nowrap">
                          ₹{(item.price || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Edit stock button */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setAdjustProduct(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-100 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Package className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-base font-bold text-slate-500">No items found</p>
                          <p className="text-sm font-medium text-slate-400">
                            {search || filterCat !== "All" || filterStatus !== "All"
                              ? "Try adjusting filters"
                              : "Add products from the Products page — they appear here automatically"}
                          </p>
                          {(search || filterCat !== "All" || filterStatus !== "All") && (
                            <button
                              onClick={() => { setSearch(""); setFilterCat("All"); setFilterStatus("All"); }}
                              className="mt-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Showing <span className="font-black text-slate-900">{filtered.length}</span> of{" "}
                <span className="font-black text-slate-900">{products.length}</span> products
              </span>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {lowStockItems.length} Low Stock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {outOfStockItems.length} Out of Stock
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stock Adjust Modal */}
      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onUpdated={fetchProducts}
        />
      )}
    </div>
  );
}
