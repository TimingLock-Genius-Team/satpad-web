import { useMemo } from "react";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const result: (number | "...")[] = [1];

    if (currentPage > 3) {
      result.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (currentPage < totalPages - 2) {
      result.push("...");
    }

    result.push(totalPages);

    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2 mt-10 mb-4">
      {/* Previous Button */}
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#161616] border border-transparent text-[#a1a1aa] hover:text-white hover:border-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <div key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#161616] text-[#a1a1aa]">
              ...
            </div>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
              isCurrent 
                ? "bg-[#161616] text-accent-primary border border-accent-primary" 
                : "bg-[#161616] text-[#a1a1aa] border border-transparent hover:text-white hover:border-[#2a2a2a]"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#161616] border border-transparent text-[#a1a1aa] hover:text-white hover:border-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
