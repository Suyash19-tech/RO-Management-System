"use client";
import toast from "react-hot-toast";

import {
  Package, Search, Filter, Download, Plus, Edit2, Trash2, Eye,
  Tag, Box, Wrench, Zap, Star, TrendingUp, AlertCircle, CheckCircle,
  Archive, X, ChevronDown, MoreHorizontal, IndianRupee, Layers,
  Home, Building2, Cpu, Droplet, ShieldCheck, Image as ImageIcon,
  ArrowUpRight, Info, AlertTriangle
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// --- Types --------------------------------------------------------------------
type Product = {
  id: string;
  name: string;
  sku?: string | null;
  category: string;
  price: number;
  purchasePrice: number;
  stock: number;
  threshold: number;
  image: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  name: string;
  category: string;
  price: string;
  purchasePrice: string;
  stock: string;
  threshold: string;
  image: string;
};

const DEFAULT_CATEGORIES = [
  { label: "Domestic RO", icon: Home, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Commercial RO", icon: Building2, color: "bg-violet-50 text-violet-700 border-violet-200" },
  { label: "Accessories", icon: Wrench, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Spare Parts", icon: Cpu, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Filters", icon: Droplet, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { label: "Membranes", icon: Layers, color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "AMC Plan", icon: ShieldCheck, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
];

const EMPTY_FORM: FormState = {
  name: "", category: "Domestic RO", price: "", purchasePrice: "",
  stock: "0", threshold: "5", image: ""
};

function getCategoryIcon(cat: string) {
  const match = DEFAULT_CATEGORIES.find(c => c.label === cat);
  return match ? match.icon : Box;
}

function getCategoryColor(cat: string) {
  const match = DEFAULT_CATEGORIES.find(c => c.label === cat);
  return match ? match.color : "bg-slate-50 text-slate-700 border-slate-200";
}

// --- Status Badge -------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; dot: string }> = {
    Active: {
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    },
    Inactive: {
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
      dot: "bg-slate-400",
    },
    Discontinued: {
      cls: "bg-rose-50 text-rose-700 border border-rose-200",
      dot: "bg-rose-500",
    },
  };
  const c = config[status] || config.Active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

// --- Stock Status Badge -------------------------------------------------------
function StockBadge({ stock, category }: { stock: number; category: string }) {
  // AMC plans don't have finite stock concerns
  if (category === "AMC Plan") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
        Unlimited
      </span>
    );
  }

  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
        Out of Stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
        Low Stock ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
      {stock} Units
    </span>
  );
}

// --- Stat Card ----------------------------------------------------------------
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs font-medium text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// --- Product Form Modal -------------------------------------------------------
function ProductModal({
  mode, product, onClose, onSave, allCategories,
}: {
  mode: "add" | "edit";
  product?: Product;
  onClose: () => void;
  onSave: () => void;
  allCategories: string[];
}) {
  const [form, setForm] = useState<FormState>(
    product
      ? {
          name: product.name ?? "",
          category: product.category ?? "Domestic RO",
          price: String(product.price ?? 0),
          purchasePrice: String(product.purchasePrice ?? 0),
          stock: String(product.stock ?? 0),
          threshold: String(product.threshold ?? 5),
          image: product.image ?? "",
        }
      : EMPTY_FORM
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max file size is 5MB'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setForm(prev => ({ ...prev, image: data.url }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally { setUploading(false); }
  }, []);

  const set = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.purchasePrice) {
      setError("Please fill in Name, Selling Price, and Purchase Price.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      const url = mode === "edit" && product ? `/api/products/${product.id}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: 'Active',
          price: parseFloat(form.price) || 0,
          purchasePrice: parseFloat(form.purchasePrice) || 0,
          stock: parseInt(form.stock || "0", 10),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred. Ensure SKU is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {mode === "add" ? "Add New Product" : "Edit Product"}
              </h2>
              <p className="text-xs font-medium text-slate-400">Specify details, prices, and stock levels</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" value={form.name} onChange={e => set("name", e.target.value)} required
              placeholder="e.g. SardarJi Classic RO 15L"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Category + Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Category</label>
              {showNewCat ? (
                <div className="flex gap-2">
                  <input
                    type="text" value={newCatInput} onChange={e => setNewCatInput(e.target.value)}
                    placeholder="e.g. Pumps"
                    className="flex-1 px-3 py-2.5 border border-blue-400 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/15 bg-white"
                    autoFocus
                  />
                  <button type="button" onClick={() => {
                    if (newCatInput.trim()) { set("category", newCatInput.trim()); }
                    setShowNewCat(false); setNewCatInput("");
                  }} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                    Add
                  </button>
                  <button type="button" onClick={() => { setShowNewCat(false); setNewCatInput(""); }}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={form.category} onChange={e => set("category", e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    {allCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewCat(true)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 rounded-xl text-xs font-bold transition-colors border border-slate-200 whitespace-nowrap"
                    title="Add new category">
                    + New
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Low Stock Alert Below
              </label>
              <div className="relative">
                <input
                  type="number" value={form.threshold} onChange={e => set("threshold", e.target.value)} min="0"
                  placeholder="e.g. 5"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all bg-slate-50 focus:bg-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">units</span>
              </div>
            </div>
          </div>

          {/* Pricing: Purchase & Selling Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Purchase Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number" value={form.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} required min="0"
                  placeholder="e.g. 8000"
                  className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number" value={form.price} onChange={e => set("price", e.target.value)} required min="0"
                  placeholder="e.g. 12500"
                  className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Product Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Product Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
            {form.image ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={form.image} alt="Product" className="w-full h-40 object-contain" />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-slate-500">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
                    <p className="text-xs font-medium text-slate-400">JPG, PNG, WEBP · Max 5MB</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl transition-colors shadow-md shadow-blue-500/20">
              {submitting ? (mode === "add" ? "Adding..." : "Saving...") : (mode === "add" ? "Add Product" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- View Modal ----------------------------------------------------------------
function ViewModal({ product, onClose, onEdit }: { product: Product; onClose: () => void; onEdit: () => void }) {
  const price = product.price || 0;
  const purchasePrice = product.purchasePrice || 0;
  const profit = price - purchasePrice;
  const marginPercent = price > 0 ? Math.round((profit / price) * 100) : 0;
  const CatIcon = getCategoryIcon(product.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative h-44 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
              <Package className="w-16 h-16" />
            </div>
          )}
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors z-10 bg-slate-900/30">
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(product.category)} border`}>
              <CatIcon className="w-3.5 h-3.5" />
              {product.category}
            </span>
            <StatusBadge status={product.status} />
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-snug">{product.name}</h2>
            <p className="text-sm font-mono font-bold text-slate-400 mt-1">SKU: {product.sku}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price</p>
              <p className="text-xl font-black text-slate-900 mt-1">₹ {price.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Price</p>
              <p className="text-xl font-black text-slate-900 mt-1">₹ {purchasePrice.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin</p>
              <p className="text-lg font-black text-emerald-600 mt-1">
                ₹ {profit.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
                  {marginPercent}%
                </span>
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Availability</p>
              <div className="mt-1">
                <StockBadge stock={product.stock} category={product.category} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">System Product ID</span>
              <span className="font-mono font-bold text-slate-700">{product.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Added On</span>
              <span className="font-bold text-slate-700">
                {new Date(product.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Last Modified</span>
              <span className="font-bold text-slate-700">
                {new Date(product.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
              Close
            </button>
            <button onClick={onEdit}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Delete Confirm ------------------------------------------------------------
function DeleteModal({ product, onClose, onDeleted }: { product: Product; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      onDeleted();
      onClose();
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Delete Product?</h2>
            <p className="text-sm font-medium text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="text-sm font-bold text-rose-800">{product.name}</p>
          <p className="text-xs font-mono text-rose-500 mt-1">{product.sku}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 rounded-xl transition-colors shadow-md shadow-rose-500/20">
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page -----------------------------------------------------------------
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Derived stats
  const totalValue = products.reduce((s, p) => {
    const price = p.price || 0;
    const stock = p.stock || 0;
    return s + (p.category !== "AMC Plan" ? price * stock : 0);
  }, 0);
  const activeProducts = products.filter(p => p.status === "Active").length;
  const categoryCount = new Set(products.map(p => p.category)).size;

  // Low Stock alert items
  const lowStockCount = products.filter(p => p.category !== "AMC Plan" && (p.stock || 0) <= 5).length;

  // Average profit margin %
  const activeMachines = products.filter(p => (p.price || 0) > 0 && (p.purchasePrice || 0) > 0);
  const avgMargin = activeMachines.length > 0 
    ? Math.round((activeMachines.reduce((s, p) => {
        const price = p.price || 0;
        const purchasePrice = p.purchasePrice || 0;
        return s + ((price - purchasePrice) / price);
      }, 0) / activeMachines.length) * 100)
    : 0;

  // Dynamic categories from live products
  const dynamicCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES.map(c => c.label),
    ...products.map(p => p.category),
  ]));

  // Filtered list
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col gap-6 pb-10 relative">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Manage stock levels, purchase prices, selling prices, and profit margins</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" />
            Export
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats removed — moved to Inventory page */}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
        <button
          onClick={() => setFilterCat("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            filterCat === "All"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          All Products
        </button>
        {dynamicCategories.map(cat => {
          const CatIcon = getCategoryIcon(cat);
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
              <span className="text-[10px] opacity-75 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md ml-1">
                {products.filter(p => p.category === cat).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Purchase Price</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Selling Price</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Margin</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((item) => {
                    const CatIcon = getCategoryIcon(item.category);
                    const price = item.price || 0;
                    const purchasePrice = item.purchasePrice || 0;
                    const profit = price - purchasePrice;
                    const marginPercent = price > 0 ? Math.round((profit / price) * 100) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Product Image + Name */}
                        <td className="px-6 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center shadow-sm">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => setViewProduct(item)}
                                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors text-left leading-snug cursor-pointer"
                              >
                                {item.name}
                              </button>
                              <p className="text-xs font-medium text-slate-400 mt-0.5">{item.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${getCategoryColor(item.category)}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            {item.category}
                          </span>
                        </td>

                        {/* Purchase Price */}
                        <td className="px-5 py-2.5 font-semibold text-slate-600 whitespace-nowrap">
                          ₹{purchasePrice.toLocaleString("en-IN")}
                        </td>

                        {/* Selling Price */}
                        <td className="px-5 py-2.5 font-black text-slate-900 whitespace-nowrap">
                          ₹{price.toLocaleString("en-IN")}
                        </td>

                        {/* Profit Margin */}
                        <td className="px-5 py-2.5 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                              ₹{profit.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-500">
                              {marginPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => setViewProduct(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditProduct(item)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteProduct(item)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Package className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-base font-bold text-slate-500">No products found</p>
                          <p className="text-sm font-medium text-slate-400">
                            {search || filterCat !== "All" || filterStatus !== "All"
                              ? "Try adjusting your search or filters"
                              : "Add your first product to get started"}
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
            <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">
                  Showing <span className="font-black text-slate-900">{filtered.length}</span> of{" "}
                  <span className="font-black text-slate-900">{products.length}</span> products
                </span>
                {(search || filterCat !== "All") && (
                  <button
                    onClick={() => { setSearch(""); setFilterCat("All"); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors ml-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {activeProducts} Active Products
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {lowStockCount} Low Stock Alert(s)
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {addOpen && (
        <ProductModal mode="add" onClose={() => setAddOpen(false)} onSave={fetchProducts} allCategories={dynamicCategories} />
      )}
      {editProduct && (
        <ProductModal
          mode="edit"
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={fetchProducts}
          allCategories={dynamicCategories}
        />
      )}
      {viewProduct && (
        <ViewModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={() => { setEditProduct(viewProduct); setViewProduct(null); }}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onDeleted={fetchProducts}
        />
      )}
    </div>
  );
}
