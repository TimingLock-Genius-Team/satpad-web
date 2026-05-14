import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12 py-8">
      {/* Left Content */}
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          The First Meme Fair Launch <br className="hidden lg:block" />
          Platform on <span className="text-accent-primary drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]">XLayer</span>.
        </h1>
        <p className="text-lg md:text-xl font-medium text-content-secondary max-w-lg">
          PUMP TO THE SATPAD. The fairest and safest way to launch and trade meme tokens.
        </p>
        <div className="pt-2">
          <Link 
            href="/create" 
            className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-bold tracking-wider text-black bg-accent-primary hover:bg-[#00e65c] transition-all duration-300 group rounded-none border border-accent-primary hover:shadow-[4px_4px_0px_rgba(0,255,102,0.5)]"
          >
            CREATE TOKEN
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Right Content / Banner */}
      <div className="flex-1 w-full max-w-2xl flex justify-end">
        <div className="relative w-full aspect-[21/9] md:aspect-video bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center p-6 group cursor-pointer border border-border hover:border-accent-primary transition-colors">
          {/* Hardcore Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
          
          {/* Banner content */}
          <div className="relative z-10 text-center space-y-5">
            <div className="inline-block px-3 py-1 bg-surface border border-border text-content-primary text-xs font-mono uppercase tracking-widest">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-primary mr-2 animate-pulse"></span>
              Live Now
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
              TRADE & PREDICT
              <br />
              <span className="text-accent-primary">
                LUCKY DRAW
              </span>
            </h3>
            <p className="text-sm md:text-base text-content-secondary font-mono">
              WIN HUGE PRIZES BY TRADING AND PREDICTING
            </p>
          </div>
          
          {/* Tech accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}
