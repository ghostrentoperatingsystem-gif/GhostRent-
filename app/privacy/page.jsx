export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 prose">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: [DATE]</em></p>
      <p>
        This policy explains what data GhostRent OS collects and how it's
        used, in line with South Africa's Protection of Personal Information
        Act (POPIA).
      </p>
      <h2>1. What we collect</h2>
      <ul>
        <li>Account info: name, surname, contact number, area</li>
        <li>Listing data: photos, prices, descriptions</li>
        <li>Payment records via Paystack (we do not store card details)</li>
        <li>Messages sent through the in-app chat</li>
      </ul>
      <h2>2. How we use it</h2>
      <p>
        To operate the listings feed, process contact-unlock payments, send
        notifications, and enforce anti-scam checks (including automated
        scanning of chat messages for contact-info sharing).
      </p>
      <h2>3. Your rights under POPIA</h2>
      <p>
        You can request access to, correction of, or deletion of your
        personal information by contacting [support email]. Requests will be
        handled within [X] business days.
      </p>
      <h2>4. Data retention</h2>
      <p>[Placeholder — define how long listings, messages, and payment records are kept after account deletion.]</p>
      <h2>5. Third parties</h2>
      <p>
        We use Supabase (data storage), Paystack (payments), and Google
        Gemini (automated message scanning) as processors. None of these
        providers are permitted to use your data for their own purposes.
      </p>
    </div>
  )
}
