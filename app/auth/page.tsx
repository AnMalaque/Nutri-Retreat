'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Flame } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (error) throw error

        router.push('/dashboard')
      } else {
        const { error } =
          await supabase.auth.signUp({
            email,
            password,
          })

        if (error) throw error

        alert(
          'Account created successfully!'
        )

        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">

      {/* background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full blur-3xl opacity-20 bg-orange-300" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl opacity-20 bg-pink-300" />
      </div>

      <div className="fusion-card w-full max-w-md relative z-10">

        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="
              h-16 w-16 rounded-2xl
              flex items-center justify-center
              text-white font-bold text-2xl
              mb-4
            "
            style={{
              background:
                'linear-gradient(135deg,#C9AD7F,#A67C5B)',
            }}
          >
            N
          </div>

          <h1 className="text-3xl font-bold">
            Nutri Retreat
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Filipino Food Exchange Tracker
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full pl-10 pr-4 py-3
                  rounded-xl
                  border
                  bg-white/70
                "
                placeholder="alex@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Password
            </label>

            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="
                  w-full pl-10 pr-4 py-3
                  rounded-xl
                  border
                  bg-white/70
                "
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              py-3
              rounded-xl
              text-white
              font-semibold
              flex items-center
              justify-center
              gap-2
            "
            style={{
              background:
                'linear-gradient(135deg,#C9AD7F,#A67C5B)',
            }}
          >
            <Flame size={18} />

            {loading
              ? 'Please wait...'
              : isLogin
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() =>
            setIsLogin(!isLogin)
          }
          className="
            w-full
            mt-5
            text-sm
            text-center
            text-gray-500
          "
        >
          {isLogin
            ? "Don't have an account? Register"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </main>
  )
}