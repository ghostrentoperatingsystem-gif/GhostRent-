'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NotificationBell({ notifications, onRefresh }) {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    onRefresh()
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-sm relative">
        🔔 {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded border z-20 max-h-80 overflow-y-auto">
          {notifications.length === 0 && <p className="p-3 text-sm text-gray-500">No notifications yet</p>}
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`p-3 text-sm border-b cursor-pointer hover:bg-gray-50 ${n.read ? 'text-gray-400' : 'font-medium'}`}
            >
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
