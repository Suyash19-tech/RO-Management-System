import * as React from "react";
import { ArrowRight } from "lucide-react";

interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
  // SVG Path for a perfect semi-circle
  const radius = 60;
  const circumference = Math.PI * radius; // Half circle length
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full rounded-[2rem] bg-gradient-to-br from-[#003B9D] via-[#0052D4] to-[#007aff] p-5 md:p-8 text-white relative overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,82,212,0.25)] min-h-[160px]">
      
      {/* Perfectly Blended Water Background */}
      <div className="absolute inset-0 pointer-events-none rounded-[2rem] overflow-hidden">
        <img 
          src="/water.png" 
          alt="Water Splash" 
          className="w-full h-full object-cover object-right mix-blend-screen opacity-90 drop-shadow-2xl scale-[1.02]"
          style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 60%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 60%)' }}
        />
      </div>

      <div className="relative z-10 w-full md:w-[60%] flex flex-col gap-2 py-0">
        <h3 className="text-[16px] md:text-lg font-bold tracking-wide drop-shadow-md">RO Care Score</h3>
        
        {/* Perfect Semi-Circle Gauge */}
        <div className="relative w-36 md:w-44 mt-1">
          <svg className="w-full h-auto drop-shadow-lg overflow-visible" viewBox="0 0 140 85">
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <path 
              d="M 10 70 A 60 60 0 0 1 130 70" 
              className="stroke-[#00287a]/80" 
              strokeWidth="11" 
              fill="transparent" 
              strokeLinecap="round"
            />
            <path 
              d="M 10 70 A 60 60 0 0 1 130 70" 
              stroke="url(#progressGradient)"
              className="transition-all duration-1000 ease-out" 
              strokeWidth="11" 
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-x-0 bottom-0 flex justify-center translate-y-1 md:translate-y-2">
            <span className="text-[38px] md:text-[46px] font-extrabold tracking-tight leading-none drop-shadow-md text-white">{score}%</span>
          </div>
        </div>

        <div className="flex flex-col items-start w-full gap-2 mt-1">
          <p className="text-[13px] md:text-[15px] font-medium leading-relaxed drop-shadow-sm whitespace-nowrap">
            Your RO is in <span className="text-[#00e5ff] font-bold">Good Condition</span>
          </p>
          
          <button className="bg-white text-[#0052D4] px-4 md:px-6 py-2 rounded-full font-bold text-[12px] md:text-sm shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:scale-105 transition-transform active:scale-95 flex items-center gap-1.5">
            View Details
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
