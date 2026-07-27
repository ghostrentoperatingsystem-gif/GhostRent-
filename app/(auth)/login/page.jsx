"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";
import FormError from "@/components/FormError";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email or password isn't right."
          : signInError.message
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(
          redirectTo
        )}`,
      },
    });

    if (oauthError) {
      setGoogleLoading(false);
      setError(oauthError.message);
    }
  }

  return (
    <AuthCard eyebrow="GhostRent OS" title="Log in">
      <FormError message={error} />

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full mb-4 rounded-card border border-line bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-paper transition disabled:opacity-50"
      >
        {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-card bg-signal px-4 py-3 text-sm font-semibold text-white hover:bg-signalDark transition disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="mt-6 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-ink">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-signal font-medium hover:text-signalDark">
          Create account
        </Link>
      </div>
    </AuthCard>
  );
}
