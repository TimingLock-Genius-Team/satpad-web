import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12 py-8">
      {/* Left Content */}
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-content-primary">
          The First Meme Fair Launch Platform on <span className="text-accent-primary">XLayer</span>.
        </h1>
        <p className="text-xl md:text-2xl font-medium text-content-secondary">
          PUMP TO THE SATPAD.
        </p>
        <div className="pt-4">
          <Link 
            href="/create" 
            className="inline-flex items-center justify-center px-10 py-4 text-xl font-black tracking-widest text-accent-primary border-2 border-accent-primary rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:shadow-[0_0_35px_rgba(0,255,102,0.7)] group"
          >
            &gt;&gt; CREATE TOKEN &lt;&lt;
          </Link>
        </div>
      </div>

      {/* Right Content / Banner */}
      <div className="flex-1 w-full max-w-lg">
        <div className="relative aspect-video rounded-2xl border border-border bg-surface-elevated overflow-hidden flex flex-col items-center justify-center p-6 group cursor-pointer hover:border-accent-primary/50 transition-colors">
          {/* Banner background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent"></div>
          
          {/* Banner content */}
          <div className="relative z-10 text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent-primary/20 text-accent-primary text-xs font-bold uppercase tracking-wider mb-2">
              Live Now
            </div>
            <h3 className="text-3xl font-black text-content-primary">
              TRADE & PREDICT
              <br />
              <span className="text-accent-primary drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                LUCKY DRAW
              </span>
            </h3>
            <p className="text-sm text-content-secondary font-medium">
              Win huge prizes by trading and predicting!
            </p>
          </div>
          
          {/* Decorative glowing elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-primary/20 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-accent-primary/20 transition-colors duration-500"></div>
        </div>
      </div>
    </div>
  );
}
