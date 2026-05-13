import { Plus, ChevronRight } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="w-full min-h-screen bg-surface-base flex flex-col items-center pt-8 md:pt-12 px-4 pb-20">
      <div className="max-w-[900px] w-full">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl md:text-[32px] font-bold tracking-tight mb-2 text-content-primary">
            Launch a token
          </h1>
          <p className="text-content-secondary text-sm md:text-base">
            Permanent. Public. Powered by math.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          {/* Progress bar background */}
          <div className="absolute left-0 top-4 w-full h-0.5 bg-border z-0" />
          {/* Active progress (currently at step 1, so width is 0 or small) */}
          <div className="absolute left-0 top-4 w-[15%] h-0.5 bg-accent-primary z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-start gap-2 bg-surface-base pr-4">
            <div className="w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary flex items-center justify-center text-accent-primary font-medium text-sm">
              1
            </div>
            <span className="text-accent-primary text-sm font-medium">Basics</span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-surface-base px-2 md:px-4">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-content-tertiary font-medium text-sm">
              2
            </div>
            <span className="text-content-tertiary text-sm">Socials</span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-surface-base px-2 md:px-4">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-content-tertiary font-medium text-sm">
              3
            </div>
            <span className="text-content-tertiary text-sm">Curve</span>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-end gap-2 bg-surface-base pl-4">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-content-tertiary font-medium text-sm">
              4
            </div>
            <span className="text-content-tertiary text-sm">Deploy</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 space-y-6">
          
          {/* Image Upload */}
          <div>
            <label className="block text-[13px] font-medium text-content-secondary mb-3">Image (optional)</label>
            <div className="flex items-center gap-6">
              <div className="w-[90px] h-[90px] flex-shrink-0 rounded-2xl bg-surface-highlight border border-border border-dashed flex items-center justify-center cursor-pointer hover:border-accent-primary/50 transition-colors">
                <Plus className="w-8 h-8 text-content-tertiary" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-content-primary text-[13px] font-medium mb-1.5">Drag and drop, or click to choose</p>
                <p className="text-content-tertiary text-[11px]">PNG / JPG / WebP - 512x512 recommended - max 1MB</p>
              </div>
            </div>
          </div>

          {/* Token Name */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[13px] font-medium text-content-secondary">Token name <span className="text-accent-warning">*</span></label>
              <span className="text-[11px] text-content-tertiary">0/32</span>
            </div>
            <input
              type="text"
              placeholder="PEPE 2099"
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors"
            />
          </div>

          {/* Symbol */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[13px] font-medium text-content-secondary">Symbol <span className="text-accent-warning">*</span></label>
              <span className="text-[11px] text-content-tertiary">0/8</span>
            </div>
            <input
              type="text"
              placeholder="PEPE"
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors uppercase"
            />
            <p className="text-[11px] text-content-tertiary mt-2">
              Auto-uppercased. Letters and numbers only, max 8 characters.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-content-secondary mb-2">Description</label>
            <div className="relative">
              <textarea
                placeholder="A frog token from the future, deployed on XLayer..."
                rows={4}
                className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 pb-8 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors resize-none"
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-content-tertiary">0/280</span>
            </div>
            <p className="text-[11px] text-content-tertiary mt-2">
              A short pitch (max 280 chars).
            </p>
          </div>

          {/* Footer / Continue Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 text-[13px]"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
