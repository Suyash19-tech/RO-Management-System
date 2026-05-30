import * as React from "react";

export function PromoBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-[#185A9D] to-[#207CE5] rounded-3xl p-6 md:p-8 relative overflow-hidden flex items-center min-h-[200px] shadow-premium">
      
      {/* Background Water Splash Overlay */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <img 
          src="https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=1200&auto=format&fit=crop" 
          alt="Water Splash" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 w-[60%] md:w-1/2">
        <h3 className="text-white text-sm md:text-lg font-bold mb-1">New Launch</h3>
        <h2 className="text-white text-xl md:text-3xl font-black mb-2 tracking-tight">Aquaguard Ultima Pro</h2>
        <p className="text-white/90 text-xs md:text-sm font-medium mb-4 md:mb-5">Next Generation RO with 10 Stage Purification</p>
        
        <button className="bg-white text-[#185A9D] px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm shadow-md hover:bg-slate-50 transition-colors">
          Shop Now
        </button>
      </div>

      {/* Product Image right aligned */}
      <div className="absolute right-0 top-0 h-full w-[40%] flex items-center justify-end pr-2 md:pr-8">
        <img 
          src="https://images.unsplash.com/photo-1544474776-904c6005dff3?q=80&w=600&auto=format&fit=crop" 
          alt="Ultima Pro" 
          className="h-[100%] md:h-[140%] object-contain drop-shadow-2xl mix-blend-multiply opacity-90"
        />
      </div>
    </div>
  );
}
