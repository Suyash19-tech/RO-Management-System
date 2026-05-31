import * as React from "react";
import { ArrowRight } from "lucide-react";

interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
  // Arc geometry: full semi-circle from 210° to 330° (240° sweep like a gauge)
  const cx = 80;
  const cy = 80;
  const r = 60;

  // Convert degrees to radians helper
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Arc from 210° to 330° (240° sweep)
  const startAngle = 210;
  const endAngle = 330;
  const totalSweep = 240; // 330 - 210 + 360 = 360... no: 210->330 going clockwise the long way = 240°
  
  const startRad = toRad(startAngle);
  const endRad = toRad(endAngle);
  
  const startX = cx + r * Math.cos(startRad);
  const startY = cy + r * Math.sin(startRad);
  const endX = cx + r * Math.cos(endRad);
  const endY = cy + r * Math.sin(endRad);

  // Full track arc path (large-arc-flag=1 for 240° > 180°)
  const trackPath = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;

  // Progress arc — calculate the angle at score%
  const progressAngle = startAngle + (score / 100) * totalSweep;
  const progressRad = toRad(progressAngle);
  const progressX = cx + r * Math.cos(progressRad);
  const progressY = cy + r * Math.sin(progressRad);

  // large-arc flag: if sweep > 180°
  const progressSweep = (score / 100) * totalSweep;
  const largeArc = progressSweep > 180 ? 1 : 0;
  const progressPath = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${progressX} ${progressY}`;

  const getConditionColor = (s: number) =>
    s >= 80 ? "#00C48C" : s >= 60 ? "#FFB020" : "#FF4D4F";
  const getConditionText = (s: number) =>
    s >= 80 ? "Excellent" : s >= 60 ? "Good" : "Needs Attention";

  return (
    <div className="w-full rounded-[2rem] bg-gradient-to-br from-[#003B9D] via-[#0052D4] to-[#007aff] p-5 md:p-6 text-white relative overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,82,212,0.25)] min-h-[180px]">
      
      {/* Water Background */}
      <div className="absolute inset-0 pointer-events-none rounded-[2rem] overflow-hidden">
        <img 
          src="/water.png" 
          alt="Water Splash" 
          className="w-full h-full object-cover object-right mix-blend-screen opacity-90 scale-[1.02]"
          style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 60%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 60%)' }}
        />
      </div>

      <div className="relative z-10 w-full flex flex-row items-center gap-4">
        
        {/* Left: Gauge */}
        <div className="flex-shrink-0">
          <p className="text-[13px] font-bold tracking-wide drop-shadow-md mb-1 opacity-90">RO Care Score</p>
          
          <div className="relative w-[160px] h-[110px]">
            <svg width="160" height="110" viewBox="0 0 160 110" className="overflow-visible">
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Track */}
              <path
                d={trackPath}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              
              {/* Progress */}
              <path
                d={progressPath}
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                filter="url(#glow)"
                className="transition-all duration-1000 ease-out"
              />

              {/* Score text — positioned at center of arc */}
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                className="font-extrabold"
                fill="white"
                fontSize="28"
                fontWeight="900"
                fontFamily="system-ui"
              >
                {score}%
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-3 flex-1 justify-center">
          <div>
            <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wider">Status</p>
            <p className="text-[15px] font-bold mt-0.5" style={{ color: getConditionColor(score) }}>
              {getConditionText(score)}
            </p>
          </div>
          
          <div>
            <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wider">Health</p>
            <div className="mt-1.5 w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${score}%`,
                  background: `linear-gradient(to right, #00e5ff, ${getConditionColor(score)})`
                }}
              />
            </div>
            <p className="text-[10px] opacity-60 mt-1">{score}/100 points</p>
          </div>

          <button className="bg-white text-[#0052D4] px-4 py-2 rounded-full font-bold text-[11px] shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center gap-1.5 w-fit">
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
