"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MarqueeTicker } from "./MarqueeTicker";
import { SatpadLogo } from "@/components/common/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface-base/80 backdrop-blur-md h-16 flex items-center px-4">
      {/* Mobile Logo */}
      <div className="flex items-center lg:hidden mr-4 shrink-0">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <SatpadLogo size={32} className="-rotate-12" />
          <span className="hidden md:block italic tracking-wider">SATPAD</span>
        </Link>
      </div>

      {/* Marquee area (takes up middle space) */}
      <div className="flex-1 overflow-hidden hidden md:flex items-center h-full mr-4 px-2">
        <MarqueeTicker />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {/* Language selector mock */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition-colors text-sm font-medium">
          <Globe className="w-4 h-4" />
          EN
        </button>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all bg-surface-elevated text-content-primary border border-white/5 hover:border-accent-primary/50 hover:text-accent-primary shadow-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all bg-accent-danger/20 text-accent-danger border border-accent-danger/30 hover:bg-accent-danger/30 shadow-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" x2="12" y1="9" y2="13" />
                          <line x1="12" x2="12.01" y1="17" y2="17" />
                        </svg>
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all bg-surface-elevated text-content-primary border border-white/5 hover:border-accent-primary/50 hover:text-accent-primary shadow-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-accent-success" />
                      {account.displayName}
                    </button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
