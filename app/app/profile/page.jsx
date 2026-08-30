"use client";

import { useState } from "react";

function Toggle({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setChecked((c) => !c)}
      className={`relative w-[46px] h-[27px] rounded-full flex-shrink-0 mt-0.5 transition-colors ${
        checked ? "bg-signal" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] h-[21px] w-[21px] bg-paper rounded-full shadow transition-transform ${
          checked ? "translate-x-[19px]" : ""
        }`}
      />
    </button>
  );
}

function Row({ title, sub, action, toggle, chevron, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start justify-between gap-3 px-5 py-[18px] border-b border-line ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-body text-[17px] font-medium text-ink">{title}</span>
        {sub && <span className="font-body text-sm text-muted leading-snug">{sub}</span>}
      </div>
      {toggle && <Toggle defaultChecked />}
      {action && (
        <button className="font-body text-[15px] text-signal underline flex-shrink-0">
          {action}
        </button>
      )}
      {chevron && <span className="text-muted text-xl flex-shrink-0">›</span>}
    </div>
  );
}

function Header({ title, onBack }) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-[22px] bg-paper">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-line/60 flex items-center justify-center text-lg text-ink flex-shrink-0"
      >
        ‹
      </button>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink m-0">
        {title}
      </h1>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const [view, setView] = useState("profile");
  const go = (v) => setView(v);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen flex flex-col bg-paper text-ink">
      {view === "profile" && (
        <>
          <div className="flex flex-col items-center px-5 pt-8 pb-6">
            <div className="w-[88px] h-[88px] rounded-full bg-signal text-paper flex items-center justify-center font-display text-3xl font-semibold">
              MM
            </div>
            <h2 className="font-display mt-3.5 mb-0.5 text-xl font-semibold text-ink">
              Mosa Mahlangu
            </h2>
            <p className="font-body m-0 text-sm text-muted">Landlord · Johannesburg</p>
          </div>

          <div className="flex gap-3 px-5 pb-4">
            <div className="flex-1 bg-ink/5 rounded-card py-4 text-center">
              <div className="font-display text-xl font-semibold text-signal">109</div>
              <div className="font-body text-xs text-muted mt-0.5">Views</div>
            </div>
            <div className="flex-1 bg-ink/5 rounded-card py-4 text-center">
              <div className="font-display text-xl font-semibold text-signal">35</div>
              <div className="font-body text-xs text-muted mt-0.5">Likes</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 px-5 pb-5">
            <button
              onClick={() => go("account")}
              className="flex items-center justify-between bg-ink/5 rounded-card px-4 py-4"
            >
              <span className="font-body text-base font-medium text-ink">Account Settings</span>
              <span className="text-muted text-xl">›</span>
            </button>
            <button
              onClick={() => go("help")}
              className="flex items-center justify-between bg-ink/5 rounded-card px-4 py-4"
            >
              <span className="font-body text-base font-medium text-ink">Get help</span>
              <span className="text-muted text-xl">›</span>
            </button>
            <button className="flex items-center justify-between bg-ink/5 rounded-card px-4 py-4">
              <span className="font-body text-base font-medium text-rust">Log out</span>
            </button>
          </div>

          <div className="mt-auto flex justify-around items-center py-2.5 border-t border-line">
            <button className="font-body flex flex-col items-center gap-0.5 text-[11px] text-muted">
              Explore
            </button>
            <button className="font-body flex flex-col items-center gap-0.5 text-[11px] text-muted">
              Favourites
            </button>
            <div className="w-[52px] h-[52px] rounded-full bg-signal text-paper flex items-center justify-center text-2xl -mt-5">
              +
            </div>
            <button className="font-body flex flex-col items-center gap-0.5 text-[11px] text-muted">
              Alerts
            </button>
            <button className="font-body flex flex-col items-center gap-0.5 text-[11px] text-signal font-semibold">
              Profile
            </button>
          </div>
        </>
      )}

      {view === "account" && (
        <>
          <Header title="Account Settings" onBack={() => go("profile")} />
          <div>
            <Row title="Personal information" chevron onClick={() => go("personal")} />
            <Row title="Login & security" chevron onClick={() => go("login-security")} />
            <Row title="Payments & payouts" chevron onClick={() => go("payments")} />
            <Row title="Notifications" chevron onClick={() => go("notifications")} />
            <Row title="Privacy" chevron onClick={() => go("privacy")} />
            <Row title="Accessibility" chevron onClick={() => go("accessibility")} />
          </div>
        </>
      )}

      {view === "personal" && (
        <>
          <Header title="Personal information" onBack={() => go("account")} />
          <div>
            <Row title="Legal name" sub="Mosa Mahlangu" action="Edit" />
            <Row title="Preferred first name" sub="Not provided" action="Add" />
            <Row title="Phone number" sub="Not provided" action="Add" />
            <Row title="Email" sub="m***a@gmail.com" action="Edit" />
            <Row title="Residential address" sub="Not provided" action="Add" />
            <Row title="Postal address" sub="Not provided" action="Add" />
          </div>
        </>
      )}

      {view === "login-security" && (
        <>
          <Header title="Login & security" onBack={() => go("account")} />
          <div>
            <Row
              title="Two-factor authentication"
              sub="Require a code by SMS when logging in from a new device"
              toggle
            />
            <Row
              title="Biometric login"
              sub="Use fingerprint or face unlock on this device"
              toggle
            />
            <Row
              title="Log out of inactive sessions"
              sub="Automatically sign out devices inactive for 30+ days"
              toggle
            />
          </div>
        </>
      )}

      {view === "payments" && (
        <>
          <Header title="Payments & payouts" onBack={() => go("account")} />
          <div>
            <Row
              title="Save card for faster unlocks"
              sub="Skip re-entering card details on your next R99 unlock"
            />
            <Row title="Payment method" sub="No card saved" action="Add" />
            <Row title="Payout account" sub="Not provided" action="Add" />
          </div>
        </>
      )}

      {view === "notifications" && (
        <>
          <Header title="Notifications" onBack={() => go("account")} />
          <div>
            <Row title="Push notifications" sub="New views, unlocks, and messages" toggle />
            <Row
              title="Email notifications"
              sub="Weekly summary of listing performance"
              toggle
            />
            <Row title="SMS alerts" sub="Only for contact unlocks" />
          </div>
        </>
      )}

      {view === "privacy" && (
        <>
          <Header title="Privacy" onBack={() => go("account")} />
          <div>
            <Row
              title="Share phone number after unlock"
              sub="Let tenants who pay the R99 unlock fee see your number"
              toggle
            />
            <Row
              title="Show listings in search engines"
              sub="Allow Google and other search engines to index your listings"
            />
            <Row
              title="Allow WhatsApp contact"
              sub="Show a WhatsApp button to tenants who've unlocked your contact"
              toggle
            />
          </div>
          <div className="mx-5 my-4 bg-ink/5 rounded-card p-[18px]">
            <h3 className="font-display text-[17px] font-semibold mb-2.5 text-ink">
              Privacy Notice
            </h3>
            <p className="font-body text-sm leading-relaxed text-muted mb-3">
              GhostRent OS collects the information you provide when creating a listing or
              account — your name, contact number, email, and property details — to connect
              landlords with prospective tenants and to process the R99 contact-unlock fee via
              Paystack. We don&apos;t sell your personal information to third parties.
            </p>
            <p className="font-body text-sm leading-relaxed text-muted">
              Under the Protection of Personal Information Act (POPIA), you have the right to
              access, correct, or request deletion of your personal information at any time.
            </p>
          </div>
        </>
      )}

      {view === "accessibility" && (
        <>
          <Header title="Accessibility" onBack={() => go("account")} />
          <div>
            <Row title="Larger text" sub="Increase text size across the app" />
            <Row title="Reduce motion" sub="Minimise animations and transitions" />
            <Row title="High contrast" sub="Increase colour contrast for readability" />
          </div>
        </>
      )}

      {view === "help" && (
        <>
          <Header title="Get help" onBack={() => go("profile")} />
          <div>
            <Row title="Visit the Help Centre" chevron />
            <Row title="Report a listing issue" chevron />
            <Row title="Report a scam or fraud concern" chevron />
            <Row title="Give us feedback" chevron />
          </div>
        </>
      )}
    </div>
  );
}