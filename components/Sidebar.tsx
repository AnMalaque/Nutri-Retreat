'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Hamburger, History, Target, LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard',    href: '/dashboard' },
  { icon: <Hamburger size={20} />,       label: 'FEL',          href: '/fel'       },
  { icon: <History size={20} />,         label: 'Food History', href: '/history'   },
  { icon: <Target size={20} />,          label: 'Meal Goals',   href: '#'          },
]

const HREF_TO_KEY: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/fel':       'fel',
  '/history':   'history',
  '#':          'goals',
}

interface SidebarProps {
  activePage: 'dashboard' | 'fel' | 'history' | 'goals' | 'profile'
}

export default function Sidebar({ activePage }: SidebarProps) {
  const router = useRouter()
  const [initial, setInitial] = useState<string>('')

  useEffect(() => {
    async function loadInitial() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', user.id)
        .maybeSingle()

      // Use first letter of first_name, fall back to first letter of email
      const letter =
        data?.first_name?.trim()?.[0]?.toUpperCase() ||
        user.email?.[0]?.toUpperCase() ||
        '?'

      setInitial(letter)
    }
    loadInitial()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const isProfileActive = activePage === 'profile'

  return (
    <aside className="fusion-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Profile icon → /profile */}
      <div className="fusion-logo">
        <Link href="/profile" title="My Profile" style={{ textDecoration: 'none' }}>
          <div
            className="fusion-logo-icon"
            style={{
              cursor: 'pointer',
              outline: isProfileActive ? '2.5px solid var(--accent)' : '2.5px solid transparent',
              outlineOffset: 2,
              transition: 'outline-color 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff',
              userSelect: 'none',
            }}
          >
            {initial || '?'}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="fusion-nav" style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = HREF_TO_KEY[item.href] === activePage
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`fusion-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              style={{ textDecoration: 'none' }}
            >
              <span className="fusion-nav-icon">{item.icon}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1px 0', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleLogout}
          title="Log out"
          className="fusion-nav-item"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 12,
            color: 'var(--text-muted)',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(232,85,85,0.12)'
            e.currentTarget.style.color = '#E85555'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  )
}