import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-8 md:py-10 mt-12 md:mt-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-8 md:gap-8">
        
        {/* Logo and Description */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-2 md:mb-0">
          <div className="text-[22px] font-semibold tracking-[-0.04em]">
            <span className="italic text-accent-primary">e</span>ulr
          </div>
          <div className="text-[13px] text-content-tertiary mt-2 max-w-[280px]">
            The exponential launchpad. Permissionless token issuance on XLayer.
          </div>
        </div>

        {/* About */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            About
          </div>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Manifesto
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              What is Eulr?
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Brand
            </Link>
          </div>
        </div>

        {/* Resources */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            Resources
          </div>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Blog
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              API
            </Link>
          </div>
        </div>

        {/* Verified contracts */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            Verified contracts
          </div>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-left text-[13px] text-content-secondary font-mono hover:text-content-primary transition-colors">
              Factory: 0xfa…cb
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-mono hover:text-content-primary transition-colors">
              Curve: 0x5e…7d
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              GitHub
            </Link>
          </div>
        </div>

        {/* Social */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            Social
          </div>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Telegram
            </Link>
            <Link href="#" className="text-left text-[13px] text-content-secondary font-sans hover:text-content-primary transition-colors">
              Discord
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
