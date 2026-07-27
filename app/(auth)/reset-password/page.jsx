"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";
import FormError from "@/components/FormError";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/login");
  }

  return (
    <AuthCard eyebrow="GhostRent OS" title="Choose a new password">
      <FormError message={error} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-card bg-signal px-4 py-3 text-sm font-semibold text-white hover:bg-signalDark transition disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}
