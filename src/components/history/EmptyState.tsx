import * as React from "react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-slate-100 rounded-3xl mt-4 bg-white/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
      
      {/* Premium Water/Mascot Integration */}
      <div className="w-32 h-32 mb-6 relative">
        <div className="absolute inset-0 bg-[#00B8A9]/10 rounded-full blur-xl scale-150 animate-pulse" />
        <img 
          src="/assets/mascot.png" 
          alt="Sardarji Mascot" 
          className="w-full h-full object-contain relative z-10 opacity-90 drop-shadow-lg"
          onError={(e) => {
            e.currentTarget.src = "https://ui-avatars.com/api/?name=SR&background=0F4C81&color=fff&size=200&rounded=true";
          }}
        />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-slate-500 max-w-[250px] leading-relaxed relative z-10">{message}</p>
    </div>
  );
}
