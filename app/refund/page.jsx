export default function RefundPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 prose">
      <h1>Refund Policy</h1>
      <p><em>Last updated: [DATE]</em></p>
      <p>
        The R99 contact-unlock fee is charged for revealing a listing's
        contact details, not for a guaranteed lease, sale, or landlord
        response.
      </p>
      <h2>Eligible for a refund</h2>
      <ul>
        <li>Payment was taken but no contact number was ever revealed (technical failure)</li>
        <li>The listing was fraudulent and is later confirmed removed for scam reports</li>
        <li>Duplicate charge for the same listing unlock</li>
      </ul>
      <h2>Not eligible for a refund</h2>
      <ul>
        <li>The landlord/tenant didn't reply or the property was already taken</li>
        <li>Change of mind after successfully unlocking the contact</li>
      </ul>
      <h2>How to request</h2>
      <p>
        Email [support email] with your payment reference within 7 days of
        the charge. Approved refunds are processed via Paystack within
        [X] business days.
      </p>
    </div>
  )
}
