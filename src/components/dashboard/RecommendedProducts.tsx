import * as React from "react";
import { ShieldCheck } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "Sediment Filter", icon: "https://images.unsplash.com/photo-1616423641405-b0b3e51a7008?q=80&w=200&auto=format&fit=crop" },
  { id: 2, name: "Carbon Filter", icon: "https://images.unsplash.com/photo-1589326176587-84bcbfafca52?q=80&w=200&auto=format&fit=crop" },
  { id: 3, name: "RO Membrane", icon: "https://images.unsplash.com/photo-1544474776-904c6005dff3?q=80&w=200&auto=format&fit=crop" },
  { id: 4, name: "Service AMC Plan", isAMC: true },
];

export function RecommendedProducts() {
  return (
    <div className="pt-2 pb-10 md:pb-0">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Recommended for You</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {PRODUCTS.map((prod) => (
          <div key={prod.id} className="bg-white border border-slate-100 p-6 rounded-3xl flex flex-col items-center justify-between text-center hover:shadow-md transition-shadow cursor-pointer h-48">
            <h4 className="font-semibold text-slate-800 text-sm mb-4">{prod.name}</h4>
            
            <div className="flex-1 flex items-center justify-center w-full relative">
              {prod.isAMC ? (
                <div className="w-16 h-16 bg-[#2A75C9]/10 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#2A75C9]" />
                </div>
              ) : (
                <img 
                  src={prod.icon} 
                  alt={prod.name} 
                  className="w-20 h-20 object-cover rounded-xl shadow-sm mix-blend-multiply grayscale-[20%]"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
