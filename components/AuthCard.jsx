export default function AuthCard({ eyebrow, title, children }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-widest uppercase text-signal font-semibold mb-2">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl text-ink mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}
