import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ blocked: false })
    }

    if (looksLikeContactInfo(text)) {
      return NextResponse.json({ blocked: true, reason: 'local-regex' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json({ blocked: false, reason: 'no-api-key' })
    }

    const prompt = `You are a content filter for a rental listings app. Decide if the message below is an attempt to share contact information (phone numbers, WhatsApp handles, email addresses, social media handles, or requests to "call me" / "hmu" / spelled-out digits like "zero eight two") so two strangers can bypass the app's paid contact-unlock feature.

Reply with exactly one word: BLOCK or ALLOW.

Message: """${text}"""`

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 5 },
        }),
      }
    )

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('Gemini API error:', resp.status, errText)
      return NextResponse.json({ blocked: false, reason: 'gemini-error' })
    }

    const data = await resp.json()
    const verdict = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toUpperCase() || ''

    return NextResponse.json({ blocked: verdict.startsWith('BLOCK') })
  } catch (err) {
    console.error('check-message route error:', err)
    return NextResponse.json({ blocked: false, reason: 'server-error' }, { status: 200 })
  }
}

function looksLikeContactInfo(raw) {
  const text = raw.toLowerCase()

  const digitsOnly = text.replace(/[^0-9]/g, '')
  if (digitsOnly.length >= 7) return true

  const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'oh']
  const wordHits = numberWords.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(text)).length
  if (wordHits >= 3) return true

  const bannedPhrases = [
    'whatsapp', 'hmu', 'call me', 'text me', 'my number',
    'contact me on', 'reach me at', '@gmail', '@yahoo', '@outlook',
  ]
  return bannedPhrases.some((p) => text.includes(p))
  }
