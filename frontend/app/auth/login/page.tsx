'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    // TODO: replace with real auth call
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    router.push('/game')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #0d2b0d 0%, #050f05 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", monospace', color: '#fff',
      padding: 24,
    }}>
      <Link href="/home" style={{
        fontSize: 28, fontWeight: 'bold', letterSpacing: 4,
        color: '#FFD700', textDecoration: 'none', marginBottom: 40,
        textShadow: '0 0 30px #FFD70055',
      }}>
        FLAG<span style={{ color: '#ef4444' }}>ZILLA</span>
      </Link>

      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(0,0,0,0.65)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: 14, padding: '36px 32px',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: '#FFD700', marginBottom: 28, textAlign: 'center' }}>
          LOGIN
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 9, letterSpacing: 3, color: '#FFFFFF55', display: 'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ fontSize: 9, letterSpacing: 3, color: '#FFFFFF55', display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ fontSize: 11, color: '#ef4444', textAlign: 'center' }}>{error}</div>
          )}

          <button type="submit" style={btnStyle}>
            ENTER THE ARENA →
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: '#FFFFFF33' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#FFD700', textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7, padding: '11px 14px',
  color: '#fff', fontSize: 13,
  fontFamily: '"Courier New", monospace',
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  marginTop: 8,
  background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
  color: '#000', border: 'none', borderRadius: 8,
  fontSize: 13, fontWeight: 'bold', letterSpacing: 3,
  padding: '13px', cursor: 'pointer',
  fontFamily: '"Courier New", monospace',
  width: '100%',
}