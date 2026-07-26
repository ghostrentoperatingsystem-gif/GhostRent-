const [search, setSearch] = useState('')
// <SearchBar onSearch={setSearch} />
const searched = search
  ? filteredProperties.filter(p =>
      p.area?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())
    )
  : filteredProperties

async function payAndUnlock(type, id) {
  setPaying(true)
  try {
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: user.email,
      amount: 9900,
      currency: 'ZAR',
      callback: async function (response) {
        try {
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: response.reference,
              userId: user.id,
              propertyId: type === 'property' ? id : undefined,
              tenantId: type === 'tenant' ? id : undefined,
            }),
          })
          const result = await res.json()
          if (!res.ok || !result.verified) {
            alert('Payment could not be verified. If you were charged, contact support with reference: ' + response.reference)
            return
          }
          alert('Payment Success! Contact Unlocked.')
          fetchData(user.id)
        } catch (err) {
          console.error('Payment verification failed:', err)
          alert('Something went wrong verifying your payment. Contact support with reference: ' + response.reference)
        } finally {
          setPaying(false)
        }
      },
      onClose: function () { setPaying(false) },
    })
    handler.openIframe()
  } catch (err) {
    console.error('Paystack setup failed:', err)
    alert('Could not start payment. Please try again.')
    setPaying(false)
  }
}
