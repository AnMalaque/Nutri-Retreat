'use client'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getFoodLogs, deleteFoodLog, deleteFoodLogsBySession } from '@/lib/services/foodlogs'
import type { FoodLogRow } from '@/lib/services/foodlogs'
import {
  Wheat, Beef, Broccoli, Milk, Apple, Flame, Trash2,
  ChevronDown, ChevronUp, CalendarDays, ClipboardList,
  TrendingUp, History,
} from 'lucide-react'
import type { LogEntry } from '@/components/FoodLog'
import AuthGuard from '@/components/AuthGuard'

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────
interface HistorySession {
  /** The calendar date string used as the grouping key, e.g. "June 17, 2025" */
  date: string
  entries: (LogEntry & { db_id: string; created_at: string })[]
  totals: { carbs: number; protein: number; fat: number; calories: number }
}

// ── Constants ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  rice:      { icon: <Wheat size={14} />,    color: '#F9A03F', label: 'Rice'      },
  meat:      { icon: <Beef size={14} />,     color: '#E85555', label: 'Meat'      },
  vegetable: { icon: <Broccoli size={14} />, color: '#7BAD6E', label: 'Vegetable' },
  milk:      { icon: <Milk size={14} />,     color: '#5B9BD5', label: 'Milk'      },
  fruit:     { icon: <Apple size={14} />,    color: '#9B59B6', label: 'Fruit'     },
} as const

// ── Helpers ────────────────────────────────────────────────────────────────

/** Groups flat DB rows into sessions keyed by local calendar date. */
function rowsToSessions(rows: FoodLogRow[]): HistorySession[] {
  const map = new Map<string, HistorySession>()

  for (const row of rows) {
    const date = new Date(row.created_at).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    if (!map.has(date)) {
      map.set(date, { date, entries: [], totals: { carbs: 0, protein: 0, fat: 0, calories: 0 } })
    }

    const session = map.get(date)!
    session.entries.push({
      id:             row.id,   // used by FoodLog / TYPE_CONFIG key
      db_id:          row.id,   // used for per-row delete
      created_at:     row.created_at,
      food_type:      row.food_type as LogEntry['food_type'],
      food_name:      row.food_name,
      filipino_name:  row.filipino_name ?? '',
      grams:          Number(row.grams),
      base_weight:    Number(row.base_weight),
      carbohydrate_g: Number(row.carbohydrate_g),
      protein_g:      Number(row.protein_g),
      fat_g:          Number(row.fat_g),
      calories:       Number(row.calories),
      unit:           row.unit,
    })

    session.totals.carbs    += Number(row.carbohydrate_g)
    session.totals.protein  += Number(row.protein_g)
    session.totals.fat      += Number(row.fat_g)
    session.totals.calories += Number(row.calories)
  }

  // rows already come in desc order → Map insertion order is newest-first
  return Array.from(map.values())
}

// ── Component ──────────────────────────────────────────────────────────────
function HistoryContent() {
  const [sessions, setSessions] = useState<HistorySession[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const rows = await getFoodLogs()
        if (!cancelled) setSessions(rowsToSessions(rows))
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to load history.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggleExpand = (date: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(date) ? next.delete(date) : next.add(date)
      return next
    })

  /** Delete a single food item row */
  const handleDeleteEntry = async (dbId: string, sessionDate: string) => {
    if (!confirm('Remove this food item?')) return
    try {
      await deleteFoodLog(dbId)
      setSessions(prev =>
        prev
          .map(s => {
            if (s.date !== sessionDate) return s
            const entries = s.entries.filter(e => e.db_id !== dbId)
            const totals = entries.reduce(
              (acc, e) => ({
                carbs:    acc.carbs    + e.carbohydrate_g,
                protein:  acc.protein  + e.protein_g,
                fat:      acc.fat      + e.fat_g,
                calories: acc.calories + e.calories,
              }),
              { carbs: 0, protein: 0, fat: 0, calories: 0 }
            )
            return { ...s, entries, totals }
          })
          .filter(s => s.entries.length > 0) // remove empty sessions
      )
    } catch (err: any) {
      toast.error(`Could not delete item: ${err?.message}`)
    }
  }

  /** Delete all rows for an entire day */
  const handleDeleteSession = async (session: HistorySession) => {
    if (!confirm(`Delete all ${session.entries.length} items from ${session.date}?`)) return
    try {
      await deleteFoodLogsBySession(session.date)
      setSessions(prev => prev.filter(s => s.date !== session.date))
    } catch (err: any) {
      toast.error(`Could not delete session: ${err?.message}`)
    }
  }

  /** Delete every row for this user */
  const handleClearAll = async () => {
    if (!confirm('Clear all food history? This cannot be undone.')) return
    try {
      await Promise.all(
        sessions.flatMap(s => s.entries.map(e => deleteFoodLog(e.db_id)))
      )
      setSessions([])
    } catch (err: any) {
      toast.error(`Could not clear history: ${err?.message}`)
    }
  }

  const allTime = sessions.reduce(
    (acc, s) => ({
      sessions: acc.sessions + 1,
      entries:  acc.entries  + s.entries.length,
      calories: acc.calories + s.totals.calories,
      carbs:    acc.carbs    + s.totals.carbs,
      protein:  acc.protein  + s.totals.protein,
      fat:      acc.fat      + s.totals.fat,
    }),
    { sessions: 0, entries: 0, calories: 0, carbs: 0, protein: 0, fat: 0 }
  )

  return (
    <div className="fusion-layout">
      <Sidebar activePage="history" />

      <div className="fusion-main">
        <main style={{ padding: '28px 28px' }}>

          {/* PAGE HEADER */}
          <div className="fusion-hero" style={{ marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #C9AD7F, #A67C5B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
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
          {!loading && sessions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { icon: <CalendarDays size={18} />,  label: 'Sessions',         val: allTime.sessions,                                              color: '#5B9BD5' },
                { icon: <ClipboardList size={18} />, label: 'Total Entries',    val: allTime.entries,                                               color: '#C9AD7F' },
                { icon: <Flame size={18} />,         label: 'Total Calories',   val: `${Math.round(allTime.calories)} kcal`,                        color: 'var(--accent)' },
                { icon: <TrendingUp size={18} />,    label: 'Avg kcal/session', val: `${Math.round(allTime.calories / allTime.sessions)} kcal`,     color: '#F9A03F' },
              ].map(s => (
                <div key={s.label} className="fusion-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <p style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* BODY */}
          {loading ? (
            <div className="fusion-card" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading history…
            </div>
          ) : error ? (
            <div className="fusion-card" style={{ padding: '48px 20px', textAlign: 'center', color: '#E85555', fontSize: 13 }}>
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div className="fusion-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <History size={40} style={{ color: 'var(--text-light)', marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>No history yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
                Add foods in the Dashboard and save your log to see it here.
              </p>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="fusion-btn" style={{ padding: '10px 24px' }}>Go to Dashboard</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sessions.map(session => {
                const isOpen = expanded.has(session.date)
                return (
                  <div key={session.date} className="fusion-card" style={{ padding: 0, overflow: 'hidden' }}>

                    {/* Session header */}
                    <div
                      onClick={() => toggleExpand(session.date)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 20px', cursor: 'pointer',
                        background: isOpen ? 'rgba(201,173,127,0.10)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{session.date}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {session.entries.length} item{session.entries.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                          { label: `C ${session.totals.carbs.toFixed(1)}g`,   color: '#F9A03F' },
                          { label: `P ${session.totals.protein.toFixed(1)}g`, color: '#5B9BD5' },
                          { label: `F ${session.totals.fat.toFixed(1)}g`,     color: '#E85555' },
                        ].map(m => (
                          <span key={m.label} style={{
                            fontSize: 11, fontWeight: 600, color: m.color,
                            background: `${m.color}18`, border: `1.5px solid ${m.color}40`,
                            padding: '3px 9px', borderRadius: 20,
                          }}>
                            {m.label}
                          </span>
                        ))}
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                          {Math.round(session.totals.calories)}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal</p>
                      </div>

                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteSession(session) }}
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
                              {['Food', 'Type', 'Amount', 'Carbs', 'Protein', 'Fat', 'kcal', ''].map(h => (
                                <th key={h} style={{
                                  padding: '8px 14px',
                                  textAlign: h === 'Food' || h === '' ? 'left' : 'right',
                                  fontSize: 10, fontWeight: 600,
                                  color: 'var(--text-muted)', textTransform: 'uppercase',
                                  letterSpacing: '0.04em', borderBottom: '1px solid var(--border)',
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
                                <tr key={entry.db_id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(246,247,221,0.15)' }}>
                                  <td style={{ padding: '9px 14px', borderBottom: '1px solid rgba(222,207,172,0.2)' }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>{entry.food_name}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{entry.filipino_name}</p>
                                  </td>
                                  <td style={{ padding: '9px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.2)' }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      fontSize: 11, fontWeight: 600, color: cfg.color,
                                      background: `${cfg.color}18`, border: `1.5px solid ${cfg.color}40`,
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
                                  <td style={{ padding: '9px 14px', borderBottom: '1px solid rgba(222,207,172,0.2)' }}>
                                    <button
                                      onClick={() => handleDeleteEntry(entry.db_id, session.date)}
                                      title="Remove item"
                                      style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-light)', padding: '2px 4px', borderRadius: 4,
                                        transition: 'color 0.12s',
                                      }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#E85555')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
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
                              <td />
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