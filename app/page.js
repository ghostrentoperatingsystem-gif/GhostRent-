'use client'
import { useState, useEffect } from 'react'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import SafeUpload from '@/components/SafeUpload'
import SearchBar from '@/components/SearchBar'

export default function Home() {
  const [user, setUser] = useState(null)
  const [hub, setHub] = useState('tenant')
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [profile, setProfile] = useState({})
  const [notifications, setNotifications] = useState([])
  const [paidIds, setPaidIds] = useState([])
  const [showPostForm, setShowPostForm] = useState(false)
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [userArea, setUserArea] = useState('Polokwane')
  const [showOnlyMyArea, setShowOnlyMyArea] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [search, setSearch] = useState('')
  const tabs = ['tenant', 'landlord', 'buyer', 'homeowner', 'profile']

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchData(session.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchData(session.user.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchData(userId) {
    setLoading(true)
    try {
      const { data: props } = await supabase.from('properties').select('*, users(name, surname, contact_number)').eq('status', 'available')
      const { data: ten } = await supabase.from('tenants').select('*, users(name, surname, area, contact_number)')
      const { data: prof } = await supabase.from('users').select('*').eq('id', userId).single()
      const { data: pays } = await supabase.from('payments').select('property_id, tenant_id').eq('user_id', userId).eq('status', 'success')
      const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)

      if (props) setProperties(props)
      if (ten) setTenants(ten)
      if (prof) { setProfile(prof); setUserArea(prof.area || 'Polokwane') }
      if (pays) setPaidIds([...pays.map(p => p.property_id), ...pays.map(p => p.tenant_id)].filter(Boolean))
      if (notifs) setNotifications(notifs)
    } catch (err) {
      console.error('fetchData failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addView(propertyId) {
    try {
      const viewed = JSON.parse(localStorage.getItem('viewed_props') || '[]')
      if (viewed.includes(propertyId)) return
      await supabase.rpc('increment_view', { prop_id: propertyId })
      localStorage.setItem('viewed_props', JSON.stringify([...viewed, propertyId]))
    } catch (err) {
      console.error('addView failed:', err)
    }
  }

  async function addLike(propertyId) {
    try {
      await supabase.rpc('increment_like', { prop_id: propertyId })
      fetchData(user.id)
    } catch (err) {
      console.error('addLike failed:', err)
    }
  }

  // Payment flow: Paystack client callback hands off to /api/verify-payment,
  // which re-checks with Paystack's server API before writing to `payments`.
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

  async function markStatus(id, status) {
    await supabase.from('properties').update({ status }).eq('id', id)
    fetchData(user.id)
  }

  async function postProperty(formData) {
    if (!profile.contact_number) { alert('Fill your CONTACT in PROFILE first!'); setHub('profile'); return }
    const { data } = await supabase.from('properties').insert([{ ...formData, user_id: user.id, status: 'available' }]).select().single()
    await supabase.from('notifications').insert([{ user_id: user.id, message: `New ${formData.type} in ${formData.area}`, link: `/property/${data.id}` }])
    setShowPostForm(false); fetchData(user.id); alert('Property Posted!')
  }

  async function postTenant(formData) {
    if (!profile.contact_number) { alert('Fill your CONTACT in PROFILE first!'); setHub('profile'); return }
    const { data } = await supabase.from('tenants').insert([{ ...formData, user_id: user.id }]).select().single()
    await supabase.from('notifications').insert([{ user_id: user.id, message: `New tenant in ${formData.area} - Budget R${data.budget}` }])
    setShowTenantForm(false); fetchData(user.id); alert('Tenant Profile Posted!')
  }

  async function saveProfile(data) {
    await supabase.from('users').upsert({ id: user.id, ...data })
    alert('Profile Saved!')
    fetchData(user.id)
  }

  function handleRemoved(propertyId) {
    setProperties(prev => prev.filter(p => p.id !== propertyId))
  }

  const areaFiltered = showOnlyMyArea && profile.area ? properties.filter(p => p.area === profile.area) : properties
  const tenantAreaFiltered = showOnlyMyArea && profile.area ? tenants.filter(t => t.area === profile.area) : tenants

  const filteredProperties = search
    ? areaFiltered.filter(p =>
        p.area?.toLowerCase().includes(search) || p.city?.toLowerCase().includes(search)
      )
    : areaFiltered

  if (!user) return <AuthScreen />
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading GhostRent OS...</div>

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="GhostRent OS" className="h-10 w-10 rounded-full" />
              <h1 className="text-2xl font-bold">GHOSTRENT OS</h1>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-sm">🔔 {notifications.length}</span>
              <button onClick={() => supabase.auth.signOut()} className="text-sm underline">Logout</button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
            {tabs.map(t => (
              <button key={t} onClick={() => setHub(t)} className={`px-4 py-2 rounded font-semibold whitespace-nowrap ${hub === t ? 'bg-black text-white' : 'bg-gray-200'}`}>{t.toUpperCase()}</button>
            ))}
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-4">
          {(hub === 'tenant' || hub === 'buyer') && <SearchBar onSearch={setSearch} />}
          {showPostForm && <PostPropertyForm user={user} onClose={() => setShowPostForm(false)} onSubmit={postProperty} />}
          {showTenantForm && <PostTenantForm user={user} onClose={() => setShowTenantForm(false)} onSubmit={postTenant} />}
          {hub === 'tenant' && <TenantView properties={filteredProperties} addView={addView} addLike={addLike} payAndUnlock={payAndUnlock} paying={paying} paidIds={paidIds} showOnlyMyArea={showOnlyMyArea} setShowOnlyMyArea={setShowOnlyMyArea} userArea={userArea} currentUserId={user.id} onRemoved={handleRemoved} />}
          {hub === 'landlord' && <LandlordView properties={properties.filter(p => p.user_id === user.id)} tenants={tenantAreaFiltered} addView={addView} addLike={addLike} payAndUnlock={payAndUnlock} paidIds={paidIds} onPost={() => setShowPostForm(true)} onPostTenant={() => setShowTenantForm(true)} onMark={markStatus} currentUserId={user.id} onRemoved={handleRemoved} />}
          {hub === 'buyer' && <BuyerView properties={filteredProperties.filter(p => p.type === 'sale')} addView={addView} addLike={addLike} payAndUnlock={payAndUnlock} paidIds={paidIds} currentUserId={user.id} onRemoved={handleRemoved} />}
          {hub === 'homeowner' && <HomeownerView properties={properties.filter(p => p.type === 'sale' && p.user_id === user.id)} onPost={() => setShowPostForm(true)} onMark={markStatus} />}
          {hub === 'profile' && <ProfileView profile={profile} onSave={saveProfile} />}
        </div>
      </div>
    </>
  )
}

function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  async function signUp() { await supabase.auth.signUp({ email, password }); alert('Check email') }
  async function signIn() { await supabase.auth.signInWithPassword({ email, password }) }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-96">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="GhostRent OS" className="h-16 w-16 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">GHOSTRENT LOGIN</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 w-full mb-3 rounded" />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 w-full mb-3 rounded" />
        <button onClick={signIn} className="w-full bg-black text-white py-2 rounded mb-2">Login</button>
        <button onClick={signUp} className="w-full bg-gray-200 py-2 rounded">Sign Up</button>
      </div>
    </div>
  )
}

function PostPropertyForm({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'rent', price: '', beds: '', city: '', area: '', pictures: [] })
  function addPic(url) { setForm({ ...form, pictures: [...form.pictures, url] }) }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="font-bold text-xl mb-4">Post New Property</h3>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border p-2 w-full mb-3 rounded">
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>
        <input placeholder="Price R" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-2 w-full mb-3 rounded" />
        <input placeholder="Beds" type="number" value={form.beds} onChange={e => setForm({ ...form, beds: e.target.value })} className="border p-2 w-full mb-3 rounded" />
        <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="border p-2 w-full mb-3 rounded" />
        <input placeholder="Area" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="border p-2 w-full mb-3 rounded" />
        <SafeUpload user={user} bucket="properties" onUploadDone={addPic} />
        {form.pictures.length > 0 && <img src={form.pictures[0]} className="h-24 w-24 object-cover rounded mb-2" />}
        <div className="flex gap-2">
          <button onClick={() => onSubmit(form)} className="flex-1 bg-black text-white py-2 rounded">Post</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function PostTenantForm({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({ area: '', budget: '', property_type_wanted: 'Flat', pictures: [] })
  function addPic(url) { setForm({ ...form, pictures: [...form.pictures, url] }) }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="font-bold text-xl mb-4">I'm Looking For A Place</h3>
        <input placeholder="Area e.g. Polokwane CBD" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="border p-2 w-full mb-3 rounded" />
        <input placeholder="Budget R" type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="border p-2 w-full mb-3 rounded" />
        <select value={form.property_type_wanted} onChange={e => setForm({ ...form, property_type_wanted: e.target.value })} className="border p-2 w-full mb-3 rounded">
          <option>Room</option>
          <option>Flat</option>
          <option>House</option>
        </select>
        <SafeUpload user={user} bucket="tenant-pics" onUploadDone={addPic} />
        {form.pictures.length > 0 && <img src={form.pictures[0]} className="h-24 w-24 object-cover rounded mb-2" />}
        <div className="flex gap-2">
          <button onClick={() => onSubmit(form)} className="flex-1 bg-black text-white py-2 rounded">Post</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function TenantView({ properties, addView, addLike, payAndUnlock, paying, paidIds, showOnlyMyArea, setShowOnlyMyArea, userArea, currentUserId, onRemoved }) {
  return (
    <div>
      <div className="bg-white p-3 rounded shadow mb-4 flex justify-between items-center">
        <div>
          <p className="font-semibold">{showOnlyMyArea ? `Showing: ${userArea}` : 'Showing: All Areas'}</p>
          <p className="text-xs text-gray-500">Toggle to filter feed</p>
        </div>
        <button onClick={() => setShowOnlyMyArea(!showOnlyMyArea)} className={`w-14 h-7 rounded-full ${showOnlyMyArea ? 'bg-black' : 'bg-gray-300'} relative`}>
          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition ${showOnlyMyArea ? 'right-1' : 'left-1'}`}></div>
        </button>
      </div>
      <h3 className="font-bold mb-2 text-lg">Properties For Rent</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.filter(p => p.type === 'rent').map(p => (
          <PropertyCard key={p.id} property={p} onView={addView} onLike={addLike} payAndUnlock={payAndUnlock} paidIds={paidIds} currentUserId={currentUserId} onRemoved={onRemoved} />
        ))}
      </div>
    </div>
  )
}

function LandlordView({ properties, tenants, addView, addLike, payAndUnlock, paidIds, onPost, onPostTenant, onMark, currentUserId, onRemoved }) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={onPost} className="bg-black text-white px-4 py-2 rounded font-semibold">+ Post Property</button>
        <button onClick={onPostTenant} className="bg-gray-800 text-white px-4 py-2 rounded font-semibold">+ Post I'm Looking</button>
      </div>
      <h3 className="font-bold text-xl mb-2">MY PROPERTIES</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {properties.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <PropertyCard property={p} onView={addView} onLike={addLike} payAndUnlock={payAndUnlock} paidIds={paidIds} currentUserId={currentUserId} onRemoved={onRemoved} />
            <div className="flex gap-2 mt-2">
              {p.status === 'available' ? (
                <button onClick={() => onMark(p.id, 'booked')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Mark Booked</button>
              ) : (
                <button onClick={() => onMark(p.id, 'available')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Mark Available Again</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <h3 className="font-bold text-xl mb-2">TENANTS LOOKING</h3>
      {tenants.map(t => (
        <div key={t.id} className="bg-white p-4 rounded shadow mb-3">
          {t.pictures?.[0] && <img src={t.pictures[0]} className="h-20 w-20 rounded-full object-cover mb-2" />}
          <p className="font-semibold">{t.users?.name} {t.users?.surname}</p>
          <p className="text-sm text-gray-600">📍 {t.area} | Budget: R{Number(t.budget).toLocaleString()} | Need: {t.property_type_wanted}</p>
          {paidIds.includes(t.id) ? (
            <a href={`tel:${t.users?.contact_number}`} className="mt-2 bg-green-600 text-white px-4 py-2 rounded block text-center">📞 {t.users?.contact_number}</a>
          ) : (
            <button onClick={() => payAndUnlock('tenant', t.id)} className="mt-2 bg-black text-white px-4 py-2 rounded">Request Call R99</button>
          )}
        </div>
      ))}
    </div>
  )
}

function BuyerView({ properties, addView, addLike, payAndUnlock, paidIds, currentUserId, onRemoved }) {
  return (
    <div>
      <h3 className="font-bold mb-2 text-lg">Houses For Sale</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map(p => (
          <PropertyCard key={p.id} property={p} onView={addView} onLike={addLike} payAndUnlock={payAndUnlock} paidIds={paidIds} currentUserId={currentUserId} onRemoved={onRemoved} />
        ))}
      </div>
    </div>
  )
}

function HomeownerView({ properties, onPost, onMark }) {
  return (
    <div>
      <button onClick={onPost} className="bg-black text-white px-4 py-2 rounded mb-4 font-semibold">+ List House For Sale</button>
      <h3 className="font-bold text-xl mb-2">MY LISTINGS</h3>
      {properties.map(p => (
        <div key={p.id} className="bg-white p-4 rounded shadow mb-3">
          <p className="font-bold text-lg">R{Number(p.price).toLocaleString()} | {p.beds} Bed | {p.area}</p>
          <p>👁 {p.views || 0} | ❤️ {p.likes || 0}</p>
          {p.status === 'available' ? (
            <button onClick={() => onMark(p.id, 'sold')} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">Mark Sold</button>
          ) : (
            <button onClick={() => onMark(p.id, 'available')} className="mt-2 bg-gray-600 text-white px-3 py-1 rounded">Mark Available Again</button>
          )}
        </div>
      ))}
    </div>
  )
}

function ProfileView({ profile, onSave }) {
  const [name, setName] = useState(profile.name || '')
  const [surname, setSurname] = useState(profile.surname || '')
  const [area, setArea] = useState(profile.area || '')
  const [contact, setContact] = useState(profile.contact_number || '')
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">MY PROFILE</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full mb-3 rounded" />
      <input placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} className="border p-2 w-full mb-3 rounded" />
      <input placeholder="Area" value={area} onChange={e => setArea(e.target.value)} className="border p-2 w-full mb-3 rounded" />
      <input placeholder="Contact" value={contact} onChange={e => setContact(e.target.value)} className="border p-2 w-full mb-3 rounded" />
      <button onClick={() => onSave({ name, surname, area, contact_number: contact })} className="w-full bg-black text-white py-3 rounded">Save Profile</button>
    </div>
  )
}