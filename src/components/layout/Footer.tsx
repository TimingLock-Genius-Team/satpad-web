import Link from "next/link";

function FooterLink({ href, children, mono }: { href: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`text-left text-[13px] text-content-secondary hover:text-content-primary transition-colors ${mono ? "font-mono" : "font-sans"}`}
    >
      {children}
    </Link>
  );
}

function ComingSoon({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span className={`text-left text-[13px] text-content-tertiary/50 cursor-not-allowed ${mono ? "font-mono" : "font-sans"}`} title="Coming soon">
      {children}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-8 md:py-10 mt-12 md:mt-20">
      <div className="max-w-[1260px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-8 md:gap-8">

        {/* Logo and Description */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-2 md:mb-0">
          <Link href="/" className="text-[22px] font-semibold tracking-[-0.04em] hover:opacity-80 transition-opacity">
            <span className="italic text-accent-primary">e</span>ulr
          </Link>
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
            <ComingSoon>Manifesto</ComingSoon>
            <ComingSoon>What is Eulr?</ComingSoon>
            <ComingSoon>Brand</ComingSoon>
          </div>
        </div>

        {/* Resources */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            Resources
          </div>
          <div className="flex flex-col gap-2">
            <FooterLink href="/docs">Docs</FooterLink>
            <ComingSoon>Blog</ComingSoon>
            <ComingSoon>API</ComingSoon>
          </div>
        </div>

        {/* Verified contracts */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            Verified contracts
          </div>
          <div className="flex flex-col gap-2">
            <ComingSoon mono>Factory: 0xfa…cb</ComingSoon>
            <ComingSoon mono>Curve: 0x5e…7d</ComingSoon>
            <ComingSoon>GitHub</ComingSoon>
          </div>
        </div>

        {/* Social */}
        <div>
          <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-[0.06em] mb-3">
            Social
          </div>
          <div className="flex flex-col gap-2">
            <FooterLink href="https://x.com/Eulr_Official">Twitter</FooterLink>
            <ComingSoon>Telegram</ComingSoon>
            <ComingSoon>Discord</ComingSoon>
          </div>
        </div>

      </div>
    </footer>
  );
}
