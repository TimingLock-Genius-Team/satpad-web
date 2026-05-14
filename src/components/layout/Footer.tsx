import Link from "next/link";
import { MessageCircle, Send, Globe } from "lucide-react";
import { SatpadLogo } from "@/components/common/Logo";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer() {
  const SocialIcons = [
    { icon: Globe, href: "#" },
    { icon: MessageCircle, href: "#" },
    { icon: YoutubeIcon, href: "#" },
    { icon: Send, href: "#" },
    { icon: XIcon, href: "#" },
  ];
  return (
    <footer className="bg-black py-16 px-4 md:px-8 border-t border-[#111]">
      <div className="container mx-auto max-w-[1400px]">
        {/* Top Section: Logo & Socials */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <SatpadLogo size={40} className="-rotate-12" />
            <span className="text-white text-3xl font-black italic tracking-wider">SATPAD</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {SocialIcons.map((item, idx) => {
              const Icon = item.icon;
              if (!Icon) return null;
              return (
                <Link 
                  key={idx}
                  href={item.href} 
                  className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#333] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="text-[#666] text-[13px] leading-relaxed max-w-[100%] font-medium">
          Disclaimer: Digital assets are highly speculative and involve significant risk of loss. The value of meme coins is extremely volatile, and any one who wishes to trade in any meme coin should be prepared for the possibility of losing their entire investment. SATPAD makes no representations or warranties regarding the success or profitability of any meme coin developed on the platform. SATPAD is a public, decentralized, and permissionless platform. Participation by any project should not be seen as an endorsement or recommendation by SATPAD. Users should assess their financial situation, risk tolerance, and do their own research before trading in any meme coins on the platform. SATPAD will not be held liable for any losses, damages, or issues that may arise from trading in any meme coins developed on the platform.
        </div>
      </div>
    </footer>
  );
}
