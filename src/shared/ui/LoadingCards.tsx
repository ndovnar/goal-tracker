export function LoadingCards({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-[28px] border border-white/70 bg-white/70 shadow-card"
        />
      ))}
    </div>
  );
}
