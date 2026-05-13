import Link from "next/link";
import { ArrowLeft, Info, Zap } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="w-full">
      <section className="w-full border-b border-border pb-10 pt-12 md:pt-20 px-4 bg-surface-base">
        <div className="max-w-[1440px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-content-tertiary hover:text-content-primary transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-content-primary">
            Launch a <span className="text-accent-primary italic drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]">token</span>
          </h1>
          <p className="text-content-secondary text-base md:text-[17px] leading-relaxed max-w-[640px]">
            Create your own token on XLayer in seconds. No code required. Just fill in the details and deploy.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-content-primary mb-5">Token Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1.5">Token Name</label>
                  <input
                    type="text"
                    placeholder="e.g. BasedKitty"
                    className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1.5">Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. BKITTY"
                    className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1.5">Description</label>
                  <textarea
                    placeholder="Describe your token in a few words..."
                    rows={3}
                    className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1.5">Avatar URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-1.5">Total Supply</label>
                    <input
                      type="text"
                      placeholder="21,000,000"
                      className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-1.5">Initial Reserve (OKB)</label>
                    <input
                      type="text"
                      placeholder="100"
                      className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 text-sm"
            >
              Launch Token
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-content-tertiary" />
                <h3 className="text-sm font-semibold text-content-primary">How it works</h3>
              </div>
              <ol className="space-y-3 text-sm text-content-secondary">
                <li className="flex gap-3">
                  <span className="text-accent-primary font-bold flex-shrink-0">1.</span>
                  Fill in your token details above
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-primary font-bold flex-shrink-0">2.</span>
                  Deposit initial OKB reserve to seed the bonding curve
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-primary font-bold flex-shrink-0">3.</span>
                  Your token goes live instantly — anyone can buy and sell
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-primary font-bold flex-shrink-0">4.</span>
                  When the reserve hits the graduation target, liquidity migrates to DEX
                </li>
              </ol>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-accent-warning" />
                <h3 className="text-sm font-semibold text-content-primary">Important Notes</h3>
              </div>
              <ul className="space-y-2 text-sm text-content-secondary">
                <li className="flex gap-2">
                  <span className="text-accent-primary">•</span>
                  Token creation is permissionless and irreversible
                </li>
                <li className="flex gap-2">
                  <span className="text-accent-primary">•</span>
                  You cannot modify token parameters after launch
                </li>
                <li className="flex gap-2">
                  <span className="text-accent-primary">•</span>
                  A small protocol fee applies to the initial deposit
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
