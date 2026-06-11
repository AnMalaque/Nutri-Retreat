'use client'

import { useState, useCallback, useEffect } from 'react'
import FoodSearch from '@/components/FoodSearch'
import FoodLog, { LogEntry } from '@/components/FoodLog'
import MacroSummary from '@/components/MacroSummary'

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

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',    active: true  },
  { icon: '📋', label: 'FEL',          active: false },
  { icon: '🕐', label: 'Food History', active: false },
  { icon: '🎯', label: 'Meal Goals',   active: false },
]

const EXCHANGE_REF = [
  { emoji: '🥦', label: 'Vegetable',        val: '3C·1P·0F = 16'   },
  { emoji: '🍎', label: 'Fruit',            val: '10C·0P·0F = 40'  },
  { emoji: '🍚', label: 'Rice A (Low P)',    val: '23C·0P·0F = 92'  },
  { emoji: '🍚', label: 'Rice B (Med P)',    val: '23C·2P·0F = 100' },
  { emoji: '🍚', label: 'Rice C (High P)',   val: '23C·4P·0F = 108' },
  { emoji: '🥛', label: 'Milk (Whole)',      val: '12C·8P·10F = 170'},
  { emoji: '🥛', label: 'Milk (Low Fat)',    val: '12C·8P·5F = 125' },
  { emoji: '🥛', label: 'Milk (Skim)',       val: '12C·8P·0F = 80'  },
  { emoji: '🥩', label: 'Meat (Low Fat)',    val: '0C·8P·1F = 41'   },
  { emoji: '🥩', label: 'Meat (Med Fat)',    val: '0C·8P·6F = 86'   },
  { emoji: '🥩', label: 'Meat (High Fat)',   val: '0C·8P·10F = 122' },
]

export default function Home() {
  const [entries, setEntries] = useState<LogEntry[]>([])

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
    setEntries((prev) => [...prev, entry])
  }, [])

  const handleRemove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleClear = () => {
    if (confirm('Clear all food entries?')) setEntries([])
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

      {/* ── SIDEBAR ── */}
      <aside className="fusion-sidebar">
        {/* Logo */}
        <div className="fusion-logo">
          <div className="fusion-logo-icon">🥗</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>NutriTrack</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Filipino FEL</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="fusion-nav">
          <p className="fusion-nav-label">Main Menu</p>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className={`fusion-nav-item ${item.active ? 'active' : ''}`}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="fusion-main">

        {/* FLOATING TIME */}
        <FloatingTime />

        {/* CONTENT */}
        <main style={{ padding: '24px 28px' }}>

          {/* ── HERO CARD ── */}
          <div className="fusion-hero" style={{ marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #FF8C5A, #FF5722)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, zIndex: 1,
            }}>🥗</div>

            <div style={{ zIndex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>Today&apos;s Nutrition</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                Food Exchange Tracker · Today&apos;s Progress
              </p>
            </div>

            <div style={{ marginLeft: 'auto', textAlign: 'right', zIndex: 1, flexShrink: 0 }}>
              <p style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                {totalKcal}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>kcal today</p>
              {entries.length > 0 && (
                <button
                  onClick={handleClear}
                  className="fusion-btn-ghost"
                  style={{ marginTop: 8, fontSize: 11, padding: '5px 12px' }}
                >
                  🗑 Clear All
                </button>
              )}
            </div>
          </div>

          {/* ── MACRO ROW + RIGHT PANEL (2-col grid) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>

            {/* LEFT: macro cards + food search + log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Macro cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {/* MacroSummary renders the 3 stat cards + the Atwater card */}
                <MacroSummary totals={totals} />
              </div>

              {/* Food search + log side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

                {/* SEARCH */}
                <FoodSearch onAddFood={handleAddFood} />

                {/* LOG */}
                <div className="fusion-card">
                  <h2 className="fusion-card-title">
                    📋 Food Log
                    <span style={{
                      fontSize: 10, fontWeight: 600, background: '#F0F0F6',
                      color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 20, marginLeft: 'auto',
                    }}>
                      {entries.length} item{entries.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  <FoodLog entries={entries} onRemove={handleRemove} />
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Atwater — rendered by MacroSummary, pulled out here via a wrapper */}
              <AtwaterPanel totals={totals} />

              {/* Exchange Reference */}
              <div className="fusion-card">
                <h3 className="fusion-card-title">📖 Exchange Reference</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {EXCHANGE_REF.map((item) => (
                    <div key={item.label} className="fusion-exch-row">
                      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                        {item.emoji} {item.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {item.val}
                      </span>
                    </div>
                  ))}
                  <p style={{ fontSize: 10, color: 'var(--text-light)', textAlign: 'center', marginTop: 6 }}>
                    C=carbs · P=protein · F=fat (g) · kcal/exchange
                  </p>
                </div>
              </div>

            </div>
          </div>

        </main>

        {/* FOOTER */}
        <footer style={{
          textAlign: 'center', padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          🌿 Nutri Retreat · Filipino Food Exchange Lists · Atwater general factors (C×4, P×4, F×9)
        </footer>
      </div>
    </div>
  )
}

/* Inline Atwater panel — avoids MacroSummary rendering it inside the macro-cards grid */
function AtwaterPanel({ totals }: { totals: { carbs: number; protein: number; fat: number; calories: number } }) {
  const carbCal  = totals.carbs   * 4
  const protCal  = totals.protein * 4
  const fatCal   = totals.fat     * 9
  const total    = carbCal + protCal + fatCal

  const rows = [
    { label: `Carbs ${totals.carbs.toFixed(1)}g × 4`,     val: carbCal, color: '#F9A03F' },
    { label: `Protein ${totals.protein.toFixed(1)}g × 4`, val: protCal, color: '#5B9BD5' },
    { label: `Fat ${totals.fat.toFixed(1)}g × 9`,         val: fatCal,  color: '#E85555' },
  ]

  return (
    <div className="fusion-card">
      <h3 className="fusion-card-title">🔥 Energy Breakdown</h3>
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

/* Floating clock pill — bottom-right corner */
function FloatingTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 28,
      zIndex: 100,
      background: 'var(--card)',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(255, 107, 53, 0.15), 0 1px 6px rgba(0,0,0,0.08)',
      padding: '10px 18px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 1,
      border: '1px solid rgba(255,107,53,0.12)',
      backdropFilter: 'blur(12px)',
    }}>
      <span style={{
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '-0.5px',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}>{timeStr}</span>
      <span style={{
        fontSize: 10,
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}>{dateStr}</span>
    </div>
  )
}
