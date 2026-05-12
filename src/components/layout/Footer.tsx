import Link from "next/link";
import { MessageCircle, Send, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-base mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-bold">
            S
          </span>
          <span className="text-content-primary font-bold">SATPAD</span>
          <span className="text-content-tertiary text-sm ml-2">© {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="#" className="text-content-secondary hover:text-accent-primary transition-colors text-sm">
            Docs
          </Link>
          <Link href="#" className="text-content-secondary hover:text-accent-primary transition-colors text-sm">
            Terms
          </Link>
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
            <Link href="#" className="text-content-tertiary hover:text-content-primary transition-colors">
              <Globe className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-content-tertiary hover:text-content-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-content-tertiary hover:text-content-primary transition-colors">
              <Send className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
