'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {

  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === 'login') {

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        alert(error.message)
        return
      }

      router.refresh()
      router.push('/')

    } else {

      const { error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        alert(error.message)
        return
      }

      alert('Account created. Please login.')
      setMode('login')
    }
  }

  return (
    <main style={{ padding: 40 }}>

      <h1>{mode === 'login' ? 'Login' : 'Create Account'}</h1>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>

      </form>

      <br />

      {mode === 'login' ? (
        <p>
          New user?{" "}
          <button onClick={() => setMode('signup')}>
            Create account
          </button>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <button onClick={() => setMode('login')}>
            Login
          </button>
        </p>
      )}

    </main>
  )
}