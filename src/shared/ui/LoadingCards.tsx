export function LoadingCards({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[32px] border border-slate-200/80 bg-white/60 p-6 shadow-card"
        >
          <div className="h-3 w-24 rounded-full bg-slate-100" />
          <div className="mt-5 h-8 w-40 rounded-full bg-slate-100" />
          <div className="mt-6 h-20 rounded-[24px] bg-slate-100/80" />
        </div>
      ))}
    </div>
  );
}
