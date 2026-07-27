"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";
import FormError from "@/components/FormError";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard eyebrow="GhostRent OS" title="Check your email">
        <p className="text-sm text-muted">
          If an account exists for <span className="text-ink">{email}</span>, we sent a
          link to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-signal font-medium hover:text-signalDark"
        >
          Back to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="GhostRent OS" title="Reset your password">
      <FormError message={error} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-card bg-signal px-4 py-3 text-sm font-semibold text-white hover:bg-signalDark transition disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm text-muted hover:text-ink"
      >
        Back to log in
      </Link>
    </AuthCard>
  );
}
