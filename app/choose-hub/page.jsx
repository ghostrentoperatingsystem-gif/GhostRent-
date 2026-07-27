"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setHubRole } from "@/services/profiles";
import FormError from "@/components/FormError";

const HUBS = [
  { id: "tenant", label: "Tenant", blurb: "Find a place to rent, near you.", href: "/tenant" },
  { id: "landlord", label: "Landlord", blurb: "List a property to rent or sell.", href: "/landlord" },
  { id: "buyer", label: "Buyer", blurb: "Browse properties for sale.", href: "/buyer" },
];

export default function ChooseHubPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  async function pick(hub) {
    setError(null);
    setLoadingId(hub.id);

    const { error: updateError } = await setHubRole(hub.id);

    setLoadingId(null);

    if (updateError) {
      setError("Couldn't save that — try again.");
      return;
    }

    router.push(hub.href);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-widest uppercase text-signal font-semibold mb-2">
          GhostRent OS
        </p>
        <h1 className="font-display text-3xl text-ink mb-8">Choose your hub</h1>

        <FormError message={error} />

        <div className="space-y-3">
          {HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => pick(hub)}
              disabled={loadingId !== null}
              className="w-full text-left rounded-card border border-line bg-white px-5 py-4 hover:border-signal transition disabled:opacity-50"
            >
              <p className="font-display text-lg text-ink">{hub.label}</p>
              <p className="text-sm text-muted mt-1">
                {loadingId === hub.id ? "Setting up…" : hub.blurb}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted">
          You can switch hubs anytime from Profile.
        </p>
      </div>
    </div>
  );
}
