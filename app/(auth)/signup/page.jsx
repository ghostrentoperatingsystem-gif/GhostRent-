"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";
import FormError from "@/components/FormError";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user && !data.session) {
      setCheckEmail(true);
      return;
    }

    router.push("/choose-hub");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <AuthCard eyebrow="GhostRent OS" title="Check your email">
        <p className="text-sm text-muted">
          We sent a confirmation link to <span className="text-ink">{email}</span>.
          Click it to activate your account, then log in.
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
    <AuthCard eyebrow="GhostRent OS" title="Create your account">
      <FormError message={error} />
      <form onSubmit={handleSignup} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-card bg-signal px-4 py-3 text-sm font-semibold text-white hover:bg-signalDark transition disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-signal font-medium hover:text-signalDark">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
        }
