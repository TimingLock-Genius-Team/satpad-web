export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:hidden mb-6 h-10 bg-surface rounded-input animate-pulse" />
      
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-24 h-10 bg-surface rounded-pill animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-4 rounded-card bg-surface border border-border h-48 animate-pulse flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-elevated shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-surface-elevated rounded w-1/2" />
                <div className="h-3 bg-surface-elevated rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-surface-elevated rounded w-full" />
              <div className="h-3 bg-surface-elevated rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
