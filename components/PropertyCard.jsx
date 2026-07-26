'use client'
import { supabase } from '@/lib/supabase'

export default function PropertyCard({ property, onView, onLike, payAndUnlock, paidIds, currentUserId, onRemoved }) {
  const isOwner = currentUserId && property.user_id === currentUserId

  async function handleRemove() {
    if (!confirm('Remove this listing? Tenants will no longer see it.')) return
    const { error } = await supabase.from('properties').update({ status: 'removed' }).eq('id', property.id)
    if (error) {
      console.error('Remove failed:', error)
      alert('Could not remove listing. Please try again.')
      return
    }
    onRemoved?.(property.id)
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      {property.pictures?.[0] && <img src={property.pictures[0]} className="w-full h-48 object-cover" />}
      <div className="p-4">
        <p className="font-bold text-xl">R{Number(property.price).toLocaleString()}</p>
        <p className="text-gray-600">{property.beds} Beds | {property.area}, {property.city}</p>
        <p className="text-xs text-gray-500">👁 {property.views || 0} | ❤️ {property.likes || 0}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => onView(property.id)} className="flex-1 bg-gray-200 py-2 rounded">View</button>
          <button onClick={() => onLike(property.id)} className="flex-1 bg-gray-200 py-2 rounded">Like</button>
        </div>
        {paidIds.includes(property.id) ? (
          <a href={`tel:${property.users?.contact_number}`} className="mt-2 bg-green-600 text-white py-2 rounded block text-center">
            📞 {property.users?.contact_number}
          </a>
        ) : (
          <button onClick={() => payAndUnlock('property', property.id)} className="mt-2 bg-black text-white w-full py-2 rounded">
            Unlock Contact R99
          </button>
        )}
        {isOwner && (
          <button onClick={handleRemove} className="mt-2 w-full border border-red-300 text-red-600 py-2 rounded">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
