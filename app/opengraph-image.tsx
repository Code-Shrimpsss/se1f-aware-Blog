import { ImageResponse } from 'next/og'

export const alt = 'Se1fAware · Vito Wang — AI Agent, full-stack engineering and interface craft'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#eff0f4',
          color: '#111216',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ position: 'absolute', width: 650, height: 650, right: -80, top: -120, borderRadius: 999, background: 'linear-gradient(135deg, #b9d8ff, #ffffff 35%, #d6c6ff 66%, #ffd7c9)', boxShadow: 'inset 0 0 100px rgba(255,255,255,.9)' }} />
        <div style={{ position: 'absolute', width: 320, height: 320, left: -90, bottom: -130, borderRadius: 999, background: 'linear-gradient(145deg, #7ddbc7, #bfdcff)', opacity: .68, filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', inset: 38, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 54px', border: '2px solid rgba(255,255,255,.9)', borderRadius: 42, background: 'rgba(255,255,255,.56)', boxShadow: '0 30px 90px rgba(51,61,92,.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, fontWeight: 700 }}>
            <div style={{ width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 18, borderRadius: 999, background: '#111216', color: '#fff', fontSize: 18 }}>S1</div>
            Se1fAware
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
            <div style={{ marginBottom: 24, color: '#ff8463', fontSize: 18, letterSpacing: 4, textTransform: 'uppercase' }}>Agent systems · Full-stack craft</div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 78, fontWeight: 700, lineHeight: .98, letterSpacing: -5 }}>让复杂变得自然，<br />清晰，耐用。</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b6e78', fontSize: 18 }}><span>Vito Wang · Engineer & Builder</span><span>se1f-aware-blog.vercel.app ↗</span></div>
        </div>
      </div>
    ),
    size
  )
}
