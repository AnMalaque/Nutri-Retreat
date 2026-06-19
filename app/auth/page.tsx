'use client'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import { signIn, signUp, sendPasswordReset } from '@/lib/services/auth'

export default function AuthPage() {
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
        router.push('/dashboard')
      } else {
        await signUp(email, password)
        toast.success('Account created successfully!')
        router.push('/dashboard')
      }
    } catch (err: any) {
      const message = err?.message || ''

      if (message.includes('Password should contain')) {
        toast.error(
          'Password must contain an uppercase letter, lowercase letter, number, and special character.'
        )
      } else {
        toast.error(message)
      }
    }finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error('Enter your email above first')
      return
    }

    setLoading(true)
    setError('')

    try {
      await sendPasswordReset(email)
      toast.success('Password reset email sent!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="fusion-auth-wrap">

      {/* ambient glow, tuned to the theme palette */}
      <div className="fusion-auth-glow">
        <span />
        <span />
      </div>

      <div className="fusion-card fusion-auth-card">

        <p className="fusion-auth-eyebrow">Nutri Retreat</p>

        <h1 className="fusion-auth-title">
          {isLogin ? 'Login' : 'Create Account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3 mt-7">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fusion-input pill icon-right"
              placeholder="Email"
            />
            <span className="fusion-input-icon-r">
              <Mail size={16} />
            </span>
          </div>

          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="fusion-input pill icon-right"
              placeholder="Password"
            />
            <span className="fusion-input-icon-r">
              <Lock size={16} />
            </span>
          </div>

          {isLogin && (
            <div className="fusion-remember-row">
              <label>
                <input
                  type="checkbox"
                  className="fusion-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="fusion-link-sm"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <div className="fusion-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="fusion-btn-solid mt-2"
          >
            {loading
              ? 'Please wait...'
              : isLogin
              ? 'Login'
              : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="fusion-auth-link mt-4"
        >
          {isLogin
            ? <><span>Don&apos;t have an account?</span> <strong>Register</strong></>
            : <><span>Already have an account?</span> <strong>Sign In</strong></>}
        </button>
      </div>
    </main>
  )
}