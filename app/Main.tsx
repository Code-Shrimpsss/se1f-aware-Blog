'use client'

export default function Home({ posts: _posts }: { posts?: unknown }) {
  return (
    <div className="garden-embed-shell">
      <iframe
        className="garden-embed"
        src="/digital-garden/index.html"
        title="Se1fAware Digital Garden"
        allow="fullscreen"
      />
    </div>
  )
}
