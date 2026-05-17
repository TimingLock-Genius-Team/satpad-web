"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X, LogOut, ExternalLink, Copy, Check, Wallet, Repeat } from "lucide-react";
import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { cn } from "@/utils/cn";
import { getDefaultChain } from "@/config/chains";

const NAV_ITEMS = [
  { href: "/", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/portfolio", label: "Portfolio" },
];

function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function chainForId() {
  return getDefaultChain();
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { address, chainId, isConnected, isReconnecting } = useAccount();
  const activeChain = chainForId();
  const { data: balanceData } = useBalance({
    address,
    chainId: chainId ?? activeChain.id,
    query: { enabled: isConnected && !!chainId },
  });
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const formattedBalance = balanceData
    ? `${parseFloat(balanceData.formatted).toFixed(2)} ${balanceData.symbol}`
    : `0 ${activeChain.nativeCurrency.symbol}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    }

    if (isWalletDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWalletDropdownOpen]);

  const handleCopyAddress = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  const handleViewExplorer = useCallback(() => {
    const explorer = activeChain.blockExplorers?.default;
    if (explorer && address) {
      window.open(`${explorer.url}/address/${address}`, "_blank");
    }
    setIsWalletDropdownOpen(false);
  }, [activeChain, address]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsWalletDropdownOpen(false);
  }, [disconnect]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-base/80 backdrop-blur-md">
      <div className="w-full max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="text-accent-primary italic">e</span>
            <span className="text-content-primary">ulr</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-medium transition-colors",
                    isActive
                      ? "text-accent-primary"
                      : "text-content-secondary hover:text-accent-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isConnected || isReconnecting ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className={cn(
                  "flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-pill font-medium text-sm transition-all",
                  "bg-surface-highlight hover:bg-surface-elevated border",
                  isWalletDropdownOpen ? "border-border-hover" : "border-border"
                )}
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
              >
                <div className="hidden md:flex items-center gap-2 pr-3 border-r border-border/60">
                  <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
                  <span className="text-content-primary">{formattedBalance}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 md:pl-1">
                  <span className="text-content-secondary font-mono text-xs md:text-sm">
                    {address ? formatAddress(address) : "..."}
                  </span>
                  <ChevronDown className={cn(
                    "w-3 h-3 md:w-4 md:h-4 text-content-secondary transition-transform",
                    isWalletDropdownOpen && "rotate-180"
                  )} />
                </div>
              </button>

              {isWalletDropdownOpen && address && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-surface-elevated border border-border rounded-2xl shadow-2xl z-50 origin-top-left">
                  <div className="p-2 pt-3 flex flex-col gap-0.5">
                    <button
                      onClick={() => { openChainModal?.(); setIsWalletDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-[14px] font-medium text-content-secondary hover:text-content-primary hover:bg-surface-highlight rounded-xl transition-colors duration-200 flex items-center gap-2"
                    >
                      <Repeat className="w-4 h-4" />
                      <span className="flex-1">Switch network</span>
                      <span className="text-[11px] text-content-tertiary font-mono">{activeChain.name}</span>
                    </button>
                    <button
                      onClick={handleCopyAddress}
                      className="w-full text-left px-3 py-2.5 text-[14px] font-medium text-content-secondary hover:text-content-primary hover:bg-surface-highlight rounded-xl transition-colors duration-200 flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-accent-primary" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy address"}
                    </button>
                    <button
                      onClick={handleViewExplorer}
                      className="w-full text-left px-3 py-2.5 text-[14px] font-medium text-content-secondary hover:text-content-primary hover:bg-surface-highlight rounded-xl transition-colors duration-200 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on explorer
                    </button>
                    <button
                      onClick={() => { router.push("/portfolio"); setIsWalletDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-[14px] font-medium text-content-secondary hover:text-content-primary hover:bg-surface-highlight rounded-xl transition-colors duration-200 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Portfolio
                    </button>
                  </div>
                  <div className="px-2 pb-2">
                    <div className="h-[1px] bg-border/50 w-full mb-1"></div>
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-3 py-2.5 text-[14px] font-medium text-accent-danger hover:text-red-400 hover:bg-accent-danger/10 rounded-xl transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openConnectModal}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-pill font-medium text-sm transition-all",
                "bg-accent-primary text-surface-base hover:opacity-90"
              )}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden md:inline">Connect Wallet</span>
              <span className="md:hidden">Connect</span>
            </button>
          )}

          <button
            className="md:hidden p-2 -mr-2 text-content-secondary hover:text-content-primary hover:bg-surface-elevated rounded-full transition-colors"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-surface-base border-b border-border shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-content-secondary hover:bg-surface-elevated hover:text-content-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
