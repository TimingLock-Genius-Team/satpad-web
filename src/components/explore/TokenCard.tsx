import Link from "next/link";
import { cn } from "@/utils/cn";
import { Token } from "@/types/token";

const truncateAddress = (addr: string) => {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-6)}`;
};

export function TokenCard({ token }: { token: Token }) {
  // Mock data
  const mockMarketCap = "5.09K"; // Changed to match the aesthetic reference
  const mockChange = "+30.2%";
  const isPositive = true;

  return (
    <Link 
      href={`/token/${token.address}`}
      className={cn(
        "block p-3 rounded-lg bg-[#161616] border border-[#2a2a2a] transition-all duration-300",
        "hover:border-accent-primary hover:shadow-[0_0_15px_rgba(0,255,102,0.1)] group",
        "relative overflow-hidden"
      )}
    >
      <div className="flex gap-4 h-full">
        {/* Left Section: Large Avatar */}
        <div className="relative w-[110px] h-[110px] shrink-0 rounded-lg bg-surface-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={token.avatarUrl} 
            alt={token.name}
            className="object-cover w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-500"
          />
          {/* Network Icon Badge */}
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#f3ba2f] rounded-full flex items-center justify-center border-[3px] border-[#161616] z-10">
             <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 24l-5-5h10l-5 5zm0-24l5 5H7l5-5zm-7 12l-5-5v10l5-5zm14 0l5 5V7l-5 5zm-7 2l-2-2 2-2 2 2-2 2z"/>
             </svg>
          </div>
        </div>

        {/* Right Section: Details */}
        <div className="flex flex-col flex-1 min-w-0 py-0.5">
          
          {/* Absolute Top-Right Badge - Perfectly flush with card corner */}
          <div className="absolute top-0 right-0">
            <span className={cn(
              "inline-block text-[11px] font-medium px-2.5 py-[3px]",
              "rounded-bl-lg rounded-tr-lg", // matches card's top-right corner
              isPositive ? "text-[#00FF66] bg-[#1a3320]" : "text-[#ff4444] bg-[#331a1a]"
            )}>
              {mockChange}
            </span>
          </div>
          
          {/* Top Info */}
          <div className="flex items-start justify-between gap-2 mb-1 pr-12">
            <h3 className="text-white font-bold text-base leading-tight truncate group-hover:text-accent-primary transition-colors mt-1">
              {token.name}
            </h3>
          </div>
          
          {/* Tags */}
          <div className="flex gap-2 mb-auto">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold text-accent-primary bg-accent-primary/10">
              Meme
            </span>
            {token.isGraduated && (
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold text-yellow-400 bg-yellow-400/10">
                Graduated
              </span>
            )}
          </div>

          {/* Bottom Stats */}
          <div className="space-y-1 mt-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#a1a1aa]">created by:</span>
              <span className="text-white underline decoration-[#a1a1aa] underline-offset-2 hover:text-accent-primary transition-colors">
                {truncateAddress(token.creator)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs pb-1">
              <span className="text-[#a1a1aa]">Market Cap:</span>
              <span className="text-white font-medium">{mockMarketCap}</span>
            </div>
            
            {/* Skewed Progress Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 h-[6px] bg-[#222] relative overflow-hidden skew-x-[-20deg]">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out",
                    token.isGraduated ? "bg-yellow-400" : "bg-accent-primary"
                  )}
                  style={{ width: `${Math.max(token.progress, 2)}%` }}
                />
              </div>
              <span className="text-accent-primary text-xs font-bold shrink-0 text-right">
                {token.progress.toFixed(3)}%
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
