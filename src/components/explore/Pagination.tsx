"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "...", totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-[8px] transition-all duration-300",
          currentPage === 1
            ? "text-content-tertiary/30 cursor-not-allowed"
            : "text-content-secondary hover:bg-[#0A0A0A] border border-transparent hover:border-border/50 hover:text-content-primary hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, idx) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-[13px] text-content-tertiary select-none"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-9 h-9 rounded-[8px] text-[13px] font-mono font-bold transition-all duration-300",
              isActive
                ? "bg-accent-primary text-surface-base shadow-[0_0_15px_rgba(46,232,144,0.4)] scale-110"
                : "text-content-secondary hover:bg-[#0A0A0A] border border-transparent hover:border-border/50 hover:text-content-primary hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-[8px] transition-all duration-300",
          currentPage === totalPages
            ? "text-content-tertiary/30 cursor-not-allowed"
            : "text-content-secondary hover:bg-[#0A0A0A] border border-transparent hover:border-border/50 hover:text-content-primary hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
