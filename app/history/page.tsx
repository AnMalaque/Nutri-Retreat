'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Hamburger,
  History,
  Target,
  Wheat,
  Beef,
  Broccoli,
  Milk,
  Apple,
  Flame,
  Trash2,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import type { LogEntry } from '@/components/FoodLog'

// ── Types ──────────────────────────────────────────────────────────────────
export interface HistorySession {
  id: string          // ISO timestamp of when log was saved
  date: string        // human-readable date label
  entries: LogEntry[]
  totals: { carbs: number; protein: number; fat: number; calories: number }
}

// ── Constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'nutri-retreat:history'

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard',    href: '/dashboard',        active: false },
  { icon: <Hamburger size={20} />,       label: 'FEL',          href: '/fel',     active: false },
  { icon: <History size={20} />,         label: 'Food History', href: '/history', active: true  },
  { icon: <Target size={20} />,          label: 'Meal Goals',   href: '#',        active: false },
]

const TYPE_CONFIG = {
  rice:      { icon: <Wheat size={14} />,    color: '#F9A03F', label: 'Rice'      },
  meat:      { icon: <Beef size={14} />,     color: '#E85555', label: 'Meat'      },
  vegetable: { icon: <Broccoli size={14} />, color: '#7BAD6E', label: 'Vegetable' },
  milk:      { icon: <Milk size={14} />,     color: '#5B9BD5', label: 'Milk'      },
  fruit:     { icon: <Apple size={14} />,    color: '#9B59B6', label: 'Fruit'     },
} as const

// ── Helpers ────────────────────────────────────────────────────────────────
function loadHistory(): HistorySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistorySession[]) : []
  } catch {
    return []
  }
}

function deleteSession(id: string): HistorySession[] {
  const updated = loadHistory().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

function clearAll(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    setSessions(loadHistory().slice().reverse()) // newest first
    setMounted(true)
  }, [])

  const toggleExpand = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleDelete = (id: string) => {
    if (!confirm('Delete this session?')) return
    setSessions(deleteSession(id).slice().reverse())
  }

  const handleClearAll = () => {
    if (!confirm('Clear all food history? This cannot be undone.')) return
    clearAll()
    setSessions([])
  }

  // Aggregate stats across all sessions
  const allTime = sessions.reduce(
    (acc, s) => ({
      sessions:  acc.sessions  + 1,
      entries:   acc.entries   + s.entries.length,
      calories:  acc.calories  + s.totals.calories,
      carbs:     acc.carbs     + s.totals.carbs,
      protein:   acc.protein   + s.totals.protein,
      fat:       acc.fat       + s.totals.fat,
    }),
    { sessions: 0, entries: 0, calories: 0, carbs: 0, protein: 0, fat: 0 }
  )

  return (
    <div className="fusion-layout">

      {/* SIDEBAR */}
      <aside className="fusion-sidebar">
        <div className="fusion-logo">
          <div className="fusion-logo-icon">A</div>
        </div>
        <nav className="fusion-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`fusion-nav-item ${item.active ? 'active' : ''}`}
              title={item.label}
              style={{ textDecoration: 'none' }}
            >
              <span className="fusion-nav-icon">{item.icon}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="fusion-main">
        <main style={{ padding: '28px 28px' }}>

          {/* PAGE HEADER */}
          <div className="fusion-hero" style={{ marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #C9AD7F, #A67C5B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}>
              <History size={28} color="#fff" />
            </div>
            <div style={{ zIndex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: 'var(--text)' }}>
                Food History
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                Saved logs from the dashboard · {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
            {sessions.length > 0 && (
              <div style={{ marginLeft: 'auto', zIndex: 1 }}>
                <button
                  className="fusion-btn-ghost"
                  style={{ fontSize: 12, padding: '6px 14px', color: '#E85555', borderColor: 'rgba(232,85,85,0.3)' }}
                  onClick={handleClearAll}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              </div>
            )}
          </div>

          {/* SUMMARY STATS */}
          {mounted && sessions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { icon: <CalendarDays size={18} />,  label: 'Sessions',      val: allTime.sessions,                    color: '#5B9BD5' },
                { icon: <ClipboardList size={18} />, label: 'Total Entries',  val: allTime.entries,                     color: '#C9AD7F' },
                { icon: <Flame size={18} />,         label: 'Total Calories', val: `${Math.round(allTime.calories)} kcal`, color: 'var(--accent)' },
                { icon: <TrendingUp size={18} />,    label: 'Avg kcal/session', val: `${Math.round(allTime.calories / allTime.sessions)} kcal`, color: '#F9A03F' },
              ].map(s => (
                <div key={s.label} className="fusion-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <p style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* SESSIONS LIST */}
          {!mounted ? (
            <div className="fusion-card" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading history…
            </div>
          ) : sessions.length === 0 ? (
            <div className="fusion-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <History size={40} style={{ color: 'var(--text-light)', marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>No history yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
                Add foods in the Dashboard and save your log to see it here.
              </p>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="fusion-btn" style={{ padding: '10px 24px' }}>
                  Go to Dashboard
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sessions.map(session => {
                const isOpen = expanded.has(session.id)
                return (
                  <div key={session.id} className="fusion-card" style={{ padding: 0, overflow: 'hidden' }}>

                    {/* Session header — always visible */}
                    <div
                      onClick={() => toggleExpand(session.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 20px', cursor: 'pointer',
                        background: isOpen ? 'rgba(201,173,127,0.10)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Date */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                          {session.date}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {session.entries.length} item{session.entries.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Macro pills */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                          { label: `C ${session.totals.carbs.toFixed(1)}g`,   color: '#F9A03F' },
                          { label: `P ${session.totals.protein.toFixed(1)}g`, color: '#5B9BD5' },
                          { label: `F ${session.totals.fat.toFixed(1)}g`,     color: '#E85555' },
                        ].map(m => (
                          <span key={m.label} style={{
                            fontSize: 11, fontWeight: 600, color: m.color,
                            background: `${m.color}18`,
                            border: `1.5px solid ${m.color}40`,
                            padding: '3px 9px', borderRadius: 20,
                          }}>
                            {m.label}
                          </span>
                        ))}
                      </div>

                      {/* Calories */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                          {Math.round(session.totals.calories)}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal</p>
                      </div>

                      {/* Expand / delete */}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(session.id) }}
                          title="Delete session"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-light)', padding: '4px 6px', borderRadius: 6,
                            transition: 'color 0.12s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#E85555')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
                        >
                          <Trash2 size={14} />
                        </button>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </div>
                    </div>

                    {/* Expanded entries table */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: 'rgba(246,247,221,0.30)' }}>
                              {['Food', 'Type', 'Amount', 'Carbs', 'Protein', 'Fat', 'kcal'].map(h => (
                                <th key={h} style={{
                                  padding: '8px 14px',
                                  textAlign: h === 'Food' ? 'left' : 'right',
                                  fontSize: 10, fontWeight: 600,
                                  color: 'var(--text-muted)', textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  borderBottom: '1px solid var(--border)',
                                }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {session.entries.map((entry, idx) => {
                              const cfg = TYPE_CONFIG[entry.food_type]
                              return (
                                <tr
                                  key={entry.id}
                                  style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(246,247,221,0.15)' }}
                                >
                                  <td style={{ padding: '9px 14px', borderBottom: '1px solid rgba(222,207,172,0.2)' }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>{entry.food_name}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{entry.filipino_name}</p>
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)' }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      fontSize: 11, fontWeight: 600, color: cfg.color,
                                      background: `${cfg.color}18`,
                                      border: `1.5px solid ${cfg.color}40`,
                                      padding: '2px 8px', borderRadius: 20,
                                    }}>
                                      {cfg.icon} {cfg.label}
                                    </span>
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    {entry.grams}{entry.unit}
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)', color: '#F9A03F', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {entry.carbohydrate_g.toFixed(1)}g
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)', color: '#5B9BD5', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {entry.protein_g.toFixed(1)}g
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)', color: '#E85555', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {entry.fat_g.toFixed(1)}g
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>
                                    {Math.round(entry.calories)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                          {/* Session totals row */}
                          <tfoot>
                            <tr style={{ background: 'rgba(201,173,127,0.12)' }}>
                              <td colSpan={3} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>
                                Session Total
                              </td>
                              <td style={{ padding: '9px 14px', textAlign: 'right', color: '#F9A03F', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>
                                {session.totals.carbs.toFixed(1)}g
                              </td>
                              <td style={{ padding: '9px 14px', textAlign: 'right', color: '#5B9BD5', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>
                                {session.totals.protein.toFixed(1)}g
                              </td>
                              <td style={{ padding: '9px 14px', textAlign: 'right', color: '#E85555', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>
                                {session.totals.fat.toFixed(1)}g
                              </td>
                              <td style={{ padding: '9px 14px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>
                                {Math.round(session.totals.calories)} kcal
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>

        <footer style={{
          textAlign: 'center', padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
           Nutri Retreat · Filipino Food Exchange Lists · Atwater general factors (C×4, P×4, F×9)
        </footer>
      </div>
    </div>
  )
}