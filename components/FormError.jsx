export default function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-card border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust">
      {message}
    </div>
  );
}
