import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="not-found-page page-reveal">
      <div className="not-found-orbit" aria-hidden="true"><i /><i /><strong>404</strong></div>
      <section data-reveal>
        <p className="spatial-mono">Signal lost</p>
        <h1>这里没有页面，<br /><em>但仍有方向。</em></h1>
        <p>这个地址可能已经移动，或从未存在。回到首页，或者继续阅读。</p>
        <div><Link href="/" className="spatial-button spatial-button-primary">返回首页 <span>↗</span></Link><Link href="/blog" className="spatial-button spatial-button-secondary">浏览文章</Link></div>
      </section>
    </div>
  )
}
