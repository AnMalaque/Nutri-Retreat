'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Hamburger, History, Target, LogOut, User,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard',    href: '/dashboard', key: 'dashboard' },
  { icon: <Hamburger size={20} />,       label: 'FEL',          href: '/fel',        key: 'fel'       },
  { icon: <History size={20} />,         label: 'Food History', href: '/history',    key: 'history'   },
  { icon: <Target size={20} />,          label: 'Meal Goals',   href: '#',           key: 'goals'     },
]

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
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="fusion-sidebar">

        {/* Profile avatar → /profile */}
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

        {/* Nav links */}
        <nav className="fusion-nav" style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`fusion-nav-item ${activePage === item.key ? 'active' : ''}`}
              title={item.label}
              style={{ textDecoration: 'none' }}
            >
              <span className="fusion-nav-icon">{item.icon}</span>
            </Link>
          ))}
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fusion-bottom-nav">

        {/* Nav items */}
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`fusion-bottom-nav-item ${activePage === item.key ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Profile */}
        <Link
          href="/profile"
          className={`fusion-bottom-nav-item ${isProfileActive ? 'active' : ''}`}
        >
          {initial
            ? (
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: isProfileActive
                  ? 'var(--accent)'
                  : 'linear-gradient(135deg, #C9AD7F, #A67C5B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
                flexShrink: 0,
              }}>
                {initial}
              </span>
            )
            : <User size={20} />
          }
          <span>Profile</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="fusion-bottom-nav-item fusion-bottom-nav-logout"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

      <style>{`
        /* ── DESKTOP: hide bottom nav ── */
        .fusion-bottom-nav { display: none; }

        /* ── MOBILE (≤768px): hide sidebar, show bottom nav ── */
        @media (max-width: 768px) {
          .fusion-sidebar { display: none !important; }

          .fusion-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 200;
            background: rgba(246, 247, 221, 0.88);
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
            border-top: 1px solid var(--glass-border);
            padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
            align-items: center;
            justify-content: space-around;
            gap: 2px;
          }

          .fusion-bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 6px 10px;
            border-radius: 12px;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.03em;
            transition: background 0.15s, color 0.15s;
            background: none;
            border: none;
            cursor: pointer;
            font-family: 'Inter', system-ui, sans-serif;
            white-space: nowrap;
            flex: 1;
            min-width: 0;
          }

          .fusion-bottom-nav-item.active {
            color: var(--accent);
            background: var(--accent-light);
          }

          .fusion-bottom-nav-item:hover:not(.active) {
            color: var(--text);
            background: rgba(201, 173, 127, 0.10);
          }

          .fusion-bottom-nav-logout:hover {
            color: #E85555 !important;
            background: rgba(232, 85, 85, 0.10) !important;
          }
        }

        /* ── VERY SMALL (≤380px): hide labels, icon-only ── */
        @media (max-width: 380px) {
          .fusion-bottom-nav-item span:last-child {
            display: none;
          }
          .fusion-bottom-nav-item {
            padding: 8px 6px;
          }
        }
      `}</style>
    </>
  )
}