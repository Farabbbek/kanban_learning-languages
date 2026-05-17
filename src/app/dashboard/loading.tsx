export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard">
      <div
        className="h-[210px] rounded-[28px] border border-[rgba(210,190,170,0.14)] bg-white/35"
        style={{
          boxShadow:
            "0 18px 56px rgba(42,33,28,0.06), 0 0 0 1px rgba(255,255,255,0.45) inset",
        }}
      >
        <div className="flex h-full flex-col justify-end gap-4 p-8">
          <div className="h-5 w-28 animate-pulse rounded-full bg-[rgba(210,190,170,0.18)]" />
          <div className="h-10 w-80 max-w-full animate-pulse rounded-full bg-[rgba(42,33,28,0.08)]" />
          <div className="h-4 w-52 animate-pulse rounded-full bg-[rgba(210,190,170,0.14)]" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[420px] rounded-[24px] border border-[rgba(210,190,170,0.14)] bg-white/30 p-4"
          >
            <div className="mb-5 h-4 w-24 animate-pulse rounded-full bg-[rgba(210,190,170,0.18)]" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((__, taskIndex) => (
                <div
                  key={taskIndex}
                  className="rounded-[18px] border border-[rgba(210,190,170,0.10)] bg-white/45 p-4"
                >
                  <div className="mb-3 h-4 w-3/4 animate-pulse rounded-full bg-[rgba(42,33,28,0.08)]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-[rgba(210,190,170,0.16)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
