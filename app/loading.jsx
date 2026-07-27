export default function Loading() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-line border-t-signal animate-spin" />
        <p className="text-sm text-muted">Loading GhostRent…</p>
      </div>
    </div>
  );
}
