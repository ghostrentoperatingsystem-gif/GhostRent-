import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    const { reference, userId, propertyId, tenantId } = await request.json()

    if (!reference || !userId) {
      return NextResponse.json({ error: 'Missing reference or userId' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    )
    const verifyData = await verifyRes.json()

    if (!verifyRes.ok || !verifyData?.data) {
      console.error('Paystack verify failed:', verifyData)
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    const tx = verifyData.data
    const isSuccessful = tx.status === 'success'
    const amountMatches = tx.amount === 9900

    if (!isSuccessful || !amountMatches) {
      return NextResponse.json({ error: 'Payment not verified', verified: false }, { status: 400 })
    }

    const { data: existing } = await supabaseServer
      .from('payments')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ verified: true, alreadyRecorded: true })
    }

    const { error: insertError } = await supabaseServer.from('payments').insert([
      {
        user_id: userId,
        property_id: propertyId || null,
        tenant_id: tenantId || null,
        amount: 99,
        status: 'success',
        reference,
      },
    ])

    if (insertError) {
      console.error('Failed to record payment:', insertError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    return NextResponse.json({ verified: true })
  } catch (err) {
    console.error('verify-payment route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
