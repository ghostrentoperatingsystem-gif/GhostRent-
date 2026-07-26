'use client'
import { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  function handleChange(value) {
    setQuery(value)
    onSearch(value.trim().toLowerCase())
  }

  return (
    <div className="mb-4">
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by area or city, e.g. Polokwane"
        className="border p-3 w-full rounded shadow-sm"
      />
    </div>
  )
}
