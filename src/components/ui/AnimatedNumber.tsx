"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/utils/cn";

interface AnimatedNumberProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

interface DiffToast {
  id: number;
  diff: number;
  xOffset: number;
}

export function AnimatedNumber({ value, formatter = (v) => v.toString(), duration = 1500 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toasts, setToasts] = useState<DiffToast[]>([]);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    // If it's the very first render, just set the value directly
    if (value === previousValueRef.current) {
      setDisplayValue(value);
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;
    const startTime = performance.now();
    
    // Spawn a floating toast for the difference
    const toastId = Date.now();
    const xOffset = Math.random() * 20 - 10; // Random horizontal offset [-10, 10]
    setToasts((prev) => [...prev, { id: toastId, diff, xOffset }]);
    
    // Clean up toast after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 1200);

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Use exponential easing for a natural deceleration
      const currentVal = startValue + (endValue - startValue) * easeOutExpo(progress);
      setDisplayValue(currentVal);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatted = formatter(displayValue);

  return (
    <span className="relative inline-block tabular-nums">
      <span className={cn(
        "inline-block transition-colors duration-300",
        isAnimating ? "text-accent-primary" : "text-inherit"
      )}
      style={{
        textShadow: isAnimating ? '0 0 12px rgba(var(--accent-primary), 0.6)' : 'none',
      }}>
        {formatted}
      </span>

      {/* Floating Diff Toasts */}
      {toasts.map((toast) => (
        <span
          key={toast.id}
          className="absolute left-full ml-1.5 bottom-0 pointer-events-none z-50 flex items-end"
          style={{ transform: `translateX(${toast.xOffset}px)` }}
        >
          <span className="block text-accent-primary font-mono font-bold text-[12px] drop-shadow-[0_0_8px_rgba(var(--accent-primary),0.8)] whitespace-nowrap animate-toast-float">
            {toast.diff > 0 ? "+" : "-"}{formatter(Math.abs(toast.diff))}
          </span>
        </span>
      ))}
    </span>
  );
}

