'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChatBox({ user, propertyId, landlordId }) {
  const [text, setText] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    setError('')
    setChecking(true)

    try {
      const res = await fetch('/api/check-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      if (!res.ok) throw new Error('Scanner unavailable')
      const { blocked } = await res.json()

      if (blocked) {
        setError('🚫 No contact info allowed. Unlock landlord number for R99')
        setChecking(false)
        return
      }

      const { error: insertError } = await supabase.from('messages').insert([
        {
          property_id: propertyId,
          sender_id: user.id,
          recipient_id: landlordId,
          content: trimmed,
        },
      ])

      if (insertError) throw insertError
      setText('')
    } catch (err) {
      console.error('Send message failed:', err)
      setError('Message failed to send. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="border rounded p-3 bg-white">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-2 border border-red-200">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !checking && handleSend()}
          placeholder="Ask a question about this property..."
          disabled={checking}
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={handleSend}
          disabled={checking || !text.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
