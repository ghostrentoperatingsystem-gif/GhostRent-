"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl text-ink mb-2">
          Something didn't load
        </h1>
        <p className="text-sm text-muted mb-6">
          {error?.message || "An unexpected error happened. Try again."}
        </p>
        <button
          onClick={reset}
          className="rounded-card bg-signal px-5 py-3 text-sm font-semibold text-white hover:bg-signalDark transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
