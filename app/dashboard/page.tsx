'use client'
import { toast } from 'sonner'
import { useState, useCallback, useEffect } from 'react'
import FoodSearch from '@/components/FoodSearch'
import FoodLog, { LogEntry } from '@/components/FoodLog'
import MacroSummary from '@/components/MacroSummary'
import Sidebar from '@/components/Sidebar'
import { saveFoodLog } from '@/lib/services/foodlogs'
import { getProfile } from '@/lib/services/profiles'
import {
  History,
  Scroll,
  Flame,
} from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

type FoodType = 'meat' | 'rice' | 'vegetable' | 'milk' | 'fruit'

interface FoodItem {
  id: number
  filipino_name: string
  english_name: string
  weight_g?: number
  amount_ml?: number
  household_measure?: string
  carbohydrate_g?: number
  protein_g?: number
  fat_g?: number
  calories: number
}

function DashboardContent() {
  const [entries,   setEntries]   = useState<LogEntry[]>([])
  const [saving,    setSaving]    = useState(false)
  const [firstName, setFirstName] = useState<string>('')

  useEffect(() => {
    getProfile()
      .then(p => { if (p?.first_name) setFirstName(p.first_name.trim()) })
      .catch(() => {})
  }, [])

  const initial     = firstName?.[0]?.toUpperCase() || '?'
  const displayName = firstName ? `Welcome, ${firstName}!` : "Today's Nutrition"

  const handleAddFood = useCallback((food: FoodItem, grams: number, type: FoodType) => {
    const baseWeight = food.weight_g || food.amount_ml || 1
    const ratio      = grams / baseWeight
    const carbG      = (food.carbohydrate_g || 0) * ratio
    const protG      = (food.protein_g      || 0) * ratio
    const fatG       = (food.fat_g          || 0) * ratio
    const totalCal   = carbG * 4 + protG * 4 + fatG * 9

    const entry: LogEntry = {
      id:             `${Date.now()}-${Math.random()}`,
      food_type:      type,
      food_name:      food.english_name,
      filipino_name:  food.filipino_name,
      grams,
      base_weight:    baseWeight,
      carbohydrate_g: carbG,
      protein_g:      protG,
      fat_g:          fatG,
      calories:       totalCal,
      unit:           type === 'milk' ? 'ml' : 'g',
    }
    setEntries(prev => [...prev, entry])
  }, [])

  const handleRemove = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const handleClear = () => {
    toast.success('Food log cleared!')
    setEntries([])
  }

  const handleSaveLog = async () => {
    if (entries.length === 0 || saving) return
    setSaving(true)
    try {
      await saveFoodLog(entries)
      toast.success('Food log saved to history!')
      setEntries([])
    } catch (err: any) {
      toast.error(`Could not save log: ${err?.message ?? 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const totals = entries.reduce(
    (acc, e) => ({
      carbs:    acc.carbs    + e.carbohydrate_g,
      protein:  acc.protein  + e.protein_g,
      fat:      acc.fat      + e.fat_g,
      calories: acc.calories + e.calories,
    }),
    { carbs: 0, protein: 0, fat: 0, calories: 0 }
  )

  const totalKcal = Math.round(totals.calories)

  return (
    <div className="fusion-layout">
      <Sidebar activePage="dashboard" />

      <div className="fusion-main">
        <FloatingTime />

        <main className="fusion-dash-main">

          {/* ── HERO CARD ── */}
          <div className="fusion-hero">
            <div className="fusion-hero-avatar">
              {initial}
            </div>

            <div style={{ zIndex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                {displayName}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                Food Exchange Tracker · Today&apos;s Progress
              </p>
            </div>

            <div className="fusion-hero-kcal">
              <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                {totalKcal}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>kcal today</p>
              {entries.length > 0 && (
                <button
                  onClick={handleClear}
                  className="fusion-btn-ghost"
                  style={{ marginTop: 8, fontSize: 11, padding: '5px 12px' }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* ── MACRO ROW ── */}
          <div className="fusion-macro-row">
            <MacroSummary totals={totals} />
          </div>

          {/* ── CONTENT GRID: Search | Log | Atwater ── */}
          <div className="fusion-content-grid">

            <FoodSearch onAddFood={handleAddFood} />

            <div className="fusion-card">
              <h2 className="fusion-card-title">
                <Scroll /> Food Log
                <span style={{
                  fontSize: 10, fontWeight: 600, background: '#F0F0F6',
                  color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 20, marginLeft: 'auto',
                }}>
                  {entries.length} item{entries.length !== 1 ? 's' : ''}
                </span>
                {entries.length > 0 && (
                  <button
                    onClick={handleSaveLog}
                    className="fusion-btn"
                    style={{ fontSize: 11, padding: '4px 12px', marginLeft: 6, opacity: saving ? 0.6 : 1 }}
                    title="Save this log to Food History"
                    disabled={saving}
                  >
                    <History size={12} /> {saving ? 'Saving…' : 'Save Log'}
                  </button>
                )}
              </h2>
              <FoodLog entries={entries} onRemove={handleRemove} />
            </div>

            <AtwaterPanel totals={totals} />

          </div>
        </main>

        <footer style={{
          textAlign: 'center', padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          Nutri Retreat · Filipino Food Exchange Lists · Atwater general factors (C×4, P×4, F×9)
        </footer>
      </div>

      <style>{`
        /* ── DASHBOARD LAYOUT ── */
        .fusion-dash-main {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }

        .fusion-hero-avatar {
          width: 56px; height: 56px;
          border-radius: 16px; flex-shrink: 0;
          background: linear-gradient(135deg, #C9AD7F, #A67C5B);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 700; color: #fff;
          user-select: none; z-index: 1;
        }

        .fusion-hero-kcal {
          margin-left: auto;
          text-align: center;
          z-index: 1;
          flex-shrink: 0;
        }

        /* 3-col macro row */
        .fusion-macro-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* 3-col content grid */
        .fusion-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 280px;
          gap: 20px;
          align-items: start;
        }

        /* ── TABLET (≤1100px): collapse to 2-col content ── */
        @media (max-width: 1100px) {
          .fusion-content-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
          }
          /* Atwater spans full width on second row */
          .fusion-content-grid > *:nth-child(3) {
            grid-column: 1 / -1;
          }
        }

        /* ── MOBILE (≤768px) ── */
        @media (max-width: 768px) {
          /* Remove sidebar offset — Sidebar.tsx hides itself and shows bottom nav */
          .fusion-main { margin-left: 0; padding-bottom: calc(72px + env(safe-area-inset-bottom)); }

          .fusion-dash-main { padding: 16px; gap: 14px; }

          /* Hero: tighten up */
          .fusion-hero { padding: 20px 18px; gap: 14px; }
          .fusion-hero-avatar { width: 44px; height: 44px; font-size: 18px; border-radius: 12px; }
          .fusion-hero p:first-child { font-size: 18px !important; }
          .fusion-hero-kcal p:first-child { font-size: 24px !important; }

          /* Macro row stays 3 cols but smaller */
          .fusion-macro-row { gap: 10px; }

          /* Full-width stacked content */
          .fusion-content-grid {
            grid-template-columns: 1fr;
          }
          .fusion-content-grid > *:nth-child(3) {
            grid-column: auto;
          }

          /* FloatingTime: hide on mobile to save space */
          .fusion-clock { display: none; }

          footer { padding: 16px !important; }
        }

        /* ── SMALL MOBILE (≤480px): macro row 1+2 layout ── */
        @media (max-width: 480px) {
          .fusion-macro-row {
            grid-template-columns: 1fr 1fr;
          }
          /* 3rd macro card (fat) spans full */
          .fusion-macro-row > *:nth-child(3) {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  )
}

function AtwaterPanel({ totals }: { totals: { carbs: number; protein: number; fat: number; calories: number } }) {
  const carbCal = totals.carbs   * 4
  const protCal = totals.protein * 4
  const fatCal  = totals.fat     * 9
  const total   = carbCal + protCal + fatCal

  const rows = [
    { label: `Carbs ${totals.carbs.toFixed(1)}g × 4`,     val: carbCal, color: '#F9A03F' },
    { label: `Protein ${totals.protein.toFixed(1)}g × 4`, val: protCal, color: '#5B9BD5' },
    { label: `Fat ${totals.fat.toFixed(1)}g × 9`,         val: fatCal,  color: '#E85555' },
  ]

  return (
    <div className="fusion-card">
      <h3 className="fusion-card-title"><Flame /> Energy Breakdown</h3>
      {rows.map((r) => (
        <div key={r.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
          <span style={{ fontWeight: 600, color: r.color }}>{Math.round(r.val)} kcal</span>
        </div>
      ))}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '8px 0 0', fontSize: 13, fontWeight: 700,
      }}>
        <span style={{ color: 'var(--text)' }}>Total</span>
        <span style={{ color: 'var(--accent)' }}>{Math.round(total)} kcal</span>
      </div>
    </div>
  )
}

function FloatingTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="fusion-clock" style={{
      position: 'fixed', bottom: 24, right: 28, zIndex: 100,
      background: 'var(--card)', borderRadius: 16,
      boxShadow: '0 4px 24px rgba(255, 107, 53, 0.15), 0 1px 6px rgba(0,0,0,0.08)',
      padding: '10px 18px', display: 'flex', flexDirection: 'column',
      alignItems: 'flex-end', gap: 1,
      border: '1px solid rgba(255,107,53,0.12)',
      backdropFilter: 'blur(12px)',
    }}>
      <span style={{
        fontSize: 20, fontWeight: 700, color: 'var(--accent)',
        letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>{timeStr}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{dateStr}</span>
    </div>
  )
}