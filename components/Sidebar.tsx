'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Hamburger,
  History,
  Target,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard',    href: '/dashboard' },
  { icon: <Hamburger size={20} />,       label: 'FEL',          href: '/fel'       },
  { icon: <History size={20} />,         label: 'Food History', href: '/history'   },
  { icon: <Target size={20} />,          label: 'Meal Goals',   href: '#'          },
]

interface SidebarProps {
  activePage: 'dashboard' | 'fel' | 'history' | 'goals'
}

export default function Sidebar({ activePage }: SidebarProps) {
  const router = useRouter()

  const HREF_TO_KEY: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/fel':       'fel',
    '/history':   'history',
    '#':          'goals',
  }

  const handleLogout = () => {
    // Clear auth state — adjust to match your actual auth mechanism
    try {
      localStorage.removeItem('sb-rphysdeamncmfxpoapug-auth-token')
    } catch {
      // ignore
    }
    router.push('/auth')
  }

  return (
    <aside className="fusion-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div className="fusion-logo">
        <div className="fusion-logo-icon">A</div>
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

      {/* Logout button — pinned to bottom */}
      <div style={{ padding: '1px 0', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleLogout}
          title="Log out"
          className="fusion-nav-item"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 12,
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