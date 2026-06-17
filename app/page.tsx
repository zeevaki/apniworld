'use client'
import { useState } from 'react'
import UploadForm from '@/components/UploadForm'
import Feed from '@/components/Feed'

export default function Home() {
  const [refresh, setRefresh] = useState(0)

  return (
    <main className="min-h-screen bg-amber-50">

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-amber-700 leading-none">اپنی دنیا</h1>
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase">ApniWorld.com</p>
          </div>
          <p className="text-sm text-stone-500 hidden sm:block">Spreading kindness, one photo at a time 🌍</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-12">

        {/* Upload section */}
        <UploadForm onPosted={() => setRefresh(r => r + 1)} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-amber-200" />
          <span className="text-amber-600 text-sm font-semibold">Kind Moments from Around the World 🌸</span>
          <div className="flex-1 h-px bg-amber-200" />
        </div>

        {/* Feed */}
        <Feed refresh={refresh} />

      </div>

      <footer className="text-center py-8 text-stone-400 text-xs">
        © {new Date().getFullYear()} ApniWorld — Our World, Together
      </footer>
    </main>
  )
}
