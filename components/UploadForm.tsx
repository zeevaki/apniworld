'use client'
import { useRef, useState } from 'react'

interface Props {
  onPosted: () => void
}

export default function UploadForm({ onPosted }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setCameraOpen(false)
  }

  async function openCamera() {
    setCameraOpen(true)
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    streamRef.current = stream
    if (videoRef.current) videoRef.current.srcObject = stream
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const captured = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      setFile(captured)
      setPreview(URL.createObjectURL(captured))
      setCameraOpen(false)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }, 'image/jpeg', 0.9)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    try {
      // 1. Get presigned URL from our API
      const { presignedUrl, publicUrl } = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: file.type }),
      }).then(r => r.json())

      // 2. Upload directly to S3
      await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

      // 3. Save post to Supabase
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: publicUrl, message }),
      })

      setFile(null)
      setPreview(null)
      setMessage('')
      onPosted()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-amber-700 mb-1 text-center">Share a Kind Moment 🌸</h2>
      <p className="text-center text-stone-500 text-sm mb-5">Upload a photo that spreads kindness to the world</p>

      {/* Camera preview */}
      {cameraOpen && (
        <div className="mb-4 relative rounded-2xl overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl" />
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-amber-700 font-bold px-6 py-2 rounded-full shadow-lg text-sm"
          >
            📸 Capture
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && !cameraOpen && (
        <div className="mb-4 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="w-full object-cover max-h-72" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Upload buttons */}
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl py-3 text-center text-amber-700 text-sm font-semibold hover:bg-amber-100 transition">
            📁 Choose Photo
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <button
            type="button"
            onClick={openCamera}
            className="flex-1 bg-rose-50 border-2 border-dashed border-rose-300 rounded-2xl py-3 text-rose-600 text-sm font-semibold hover:bg-rose-100 transition"
          >
            📷 Take Photo
          </button>
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write something kind... 💛"
          rows={3}
          className="border border-stone-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold py-3 rounded-2xl transition text-sm"
        >
          {loading ? 'Sharing...' : '🌍 Share with the World'}
        </button>
      </form>
    </div>
  )
}
