"use client";

import { MoreVertical, Plus, Minus, AlertTriangle, Layers } from "lucide-react";
import { useState, useEffect } from "react";

type InventoryItem = {
  id: string;
  item: string;
  sku: string;
  category: string;
  stock: number;
  reorder: number;
  status: string;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Stock": "bg-emerald-100 text-emerald-700",
    "Low Stock": "bg-amber-100 text-amber-700",
    "Out of Stock": "bg-rose-100 text-rose-700",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch inventory", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading inventory items...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU / ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                      <Layers className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{item.item}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{item.sku}</span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">{item.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-600">{item.category}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-black ${item.stock === 0 ? 'text-rose-500' : item.stock <= item.reorder ? 'text-amber-500' : 'text-slate-900'}`}>
                      {item.stock}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reorder</span>
                      <span className="text-xs font-bold text-slate-600">{item.reorder} units</span>
                    </div>
                    {item.stock <= item.reorder && item.stock > 0 && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 ml-2 animate-pulse" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors border border-transparent hover:border-emerald-200" title="Add Stock">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-200" title="Deduct Stock">
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{inventory.length}</span> items
        </span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#2563EB] rounded-lg">1</button>
          </div>
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
