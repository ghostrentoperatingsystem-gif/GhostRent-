'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SafeUpload({ user, bucket, onUploadDone }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      if (!user?.id) throw new Error('User not authenticated')

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadDone?.(publicData.publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="mb-3">
      <label className="flex items-center justify-center border-2 border-dashed p-3 rounded cursor-pointer hover:bg-gray-50">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <span className="text-sm text-gray-600">
          {uploading ? '⏳ Uploading...' : '📸 Click to add photo'}
        </span>
      </label>
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
