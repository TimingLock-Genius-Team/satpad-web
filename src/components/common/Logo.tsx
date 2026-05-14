import React from 'react';
import { cn } from '@/utils/cn';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export function SatpadLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="satpadGrad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00e65c" />
          <stop offset="50%" stopColor="#00FF66" />
          <stop offset="100%" stopColor="#a3ffc2" />
        </linearGradient>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer block: Regular geometric octagon (chamfered square) */}
      <path 
        d="M 25 10 L 75 10 L 90 25 L 90 75 L 75 90 L 25 90 L 10 75 L 10 25 Z" 
        fill="#0a0a0a" 
        stroke="#00FF66" 
        strokeWidth="1.5" 
        strokeOpacity="0.25"
      />
      
      <path 
        d="M 25 10 L 75 10 L 90 25 L 90 75 L 75 90 L 25 90 L 10 75 L 10 25 Z" 
        fill="#00FF66"
        fillOpacity="0.02"
      />

      {/* Abstract 'S' forming a launch trajectory */}
      <path 
        d="M 75 30 L 45 30 L 35 50 L 70 50 L 55 70 L 25 70" 
        stroke="url(#satpadGrad)" 
        strokeWidth="12" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
        filter="url(#neonGlow)"
      />

      {/* Rocket upward arrow in top right */}
      <path 
        d="M 80 30 L 95 10 L 65 20 Z" 
        fill="#00FF66" 
        filter="url(#neonGlow)"
      />

      {/* Tech grid/dots accent */}
      <circle cx="80" cy="80" r="2.5" fill="#00FF66" filter="url(#neonGlow)" />
      <circle cx="70" cy="80" r="2.5" fill="#00FF66" fillOpacity="0.5" />
      <circle cx="80" cy="70" r="2.5" fill="#00FF66" fillOpacity="0.5" />
    </svg>
  );
}
