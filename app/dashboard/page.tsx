'use client'
import './dashboard.css'
import { toast } from 'sonner'
import { useState, useCallback, useEffect } from 'react'
import FoodSearch from '@/components/FoodSearch'
import FoodLog, { LogEntry } from '@/components/FoodLog'
import MacroSummary from '@/components/MacroSummary'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { saveFoodLog } from '@/lib/services/foodlogs'
import { getProfile, hasCompletedOnboarding } from '@/lib/services/profiles'
import {
  History,
  Scroll,
  Flame,
} from 'lucide-react'
import OnboardingWizard from '@/app/onboarding/OnboardingWizard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardWithOnboarding />
    </AuthGuard>
  )
}

function DashboardWithOnboarding() {
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checkCount, setCheckCount] = useState(0)

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const completed = await hasCompletedOnboarding()
        setShowOnboarding(!completed)
      } catch (err) {
        console.error('Error checking onboarding:', err)
        // Continue to dashboard if check fails
        setShowOnboarding(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboarding()
  }, [checkCount])

  // Re-check onboarding every 2 seconds (for quick redirect detection)
  useEffect(() => {
    if (showOnboarding || isLoading) return

    const interval = setInterval(() => {
      setCheckCount(prev => prev + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [showOnboarding, isLoading])

  if (isLoading) {
    return (
      <div className="fusion-layout">
        <Sidebar activePage="dashboard" />
        <div className="fusion-main">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingWizard />
  }

  return <DashboardContent />
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
                <span className="fusion-log-count">
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

        <footer className="fusion-dashboard-footer">
          Nutri Retreat · Filipino Food Exchange Lists · Atwater general factors (C×4, P×4, F×9)
        </footer>
      </div>
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