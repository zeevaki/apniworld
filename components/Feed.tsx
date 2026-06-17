'use client'
import { useEffect, useState } from 'react'

interface Post {
  id: string
  image_url: string
  message: string
  created_at: string
}

interface Props {
  refresh: number
}

export default function Feed({ refresh }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
  }, [refresh])

  if (loading) return (
    <div className="text-center text-stone-400 py-16 text-sm">Loading kindness from around the world...</div>
  )

  if (!posts.length) return (
    <div className="text-center text-stone-400 py-16 text-sm">Be the first to share a kind moment 🌸</div>
  )

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {posts.map(post => (
        <div key={post.id} className="break-inside-avoid bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt={post.message || 'A kind moment'} className="w-full object-cover" />
          {post.message && (
            <div className="px-4 py-3">
              <p className="text-stone-700 text-sm leading-relaxed">{post.message}</p>
              <p className="text-stone-400 text-xs mt-2">
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
