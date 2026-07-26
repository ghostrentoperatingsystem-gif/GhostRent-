'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ count: userCount }, { count: propCount }, { count: payCount }, { data: reportRows }] =
      await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'success'),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
      ])

    setStats({
      users: userCount || 0,
      properties: propCount || 0,
      payments: payCount || 0,
      revenue: (payCount || 0) * 99,
    })
    setReports(reportRows || [])
    setLoading(false)
  }

  async function resolveReport(id, status) {
    await supabase.from('reports').update({ status }).eq('id', id)
    load()
  }

  async function removeListing(propertyId) {
    await supabase.from('properties').update({ status: 'removed' }).eq('id', propertyId)
    load()
  }

  if (loading) return <div className="p-6">Loading admin dashboard...</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Properties" value={stats.properties} />
        <StatCard label="Paid Unlocks" value={stats.payments} />
        <StatCard label="Revenue" value={`R${stats.revenue.toLocaleString()}`} />
      </div>
      <h2 className="text-xl font-bold mb-3">Reports</h2>
      {reports.length === 0 && <p className="text-gray-500">No reports.</p>}
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.reason}</p>
              <p className="text-sm text-gray-500">Property: {r.property_id} · Status: {r.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => removeListing(r.property_id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Remove Listing</button>
              <button onClick={() => resolveReport(r.id, 'resolved')} className="bg-gray-200 px-3 py-1 rounded text-sm">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
              }
