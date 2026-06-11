'use client'
import {
  Wheat,
  BicepsFlexed,
  Cuboid
} from 'lucide-react'

interface MacroTotals {
  carbs: number
  protein: number
  fat: number
  calories: number
}

interface MacroSummaryProps {
  totals: MacroTotals
}

export default function MacroSummary({ totals }: MacroSummaryProps) {
  const carbCal = totals.carbs * 4
  const protCal = totals.protein * 4
  const fatCal  = totals.fat * 9
  const totalFromMacros = carbCal + protCal + fatCal

  const carbPct = totalFromMacros > 0 ? (carbCal / totalFromMacros) * 100 : 0
  const protPct = totalFromMacros > 0 ? (protCal / totalFromMacros) * 100 : 0
  const fatPct  = totalFromMacros > 0 ? (fatCal  / totalFromMacros) * 100 : 0

  const macros = [
    {
      key: 'carbs',
      label: 'Carbohydrates',
      icon: <Wheat color="#FFA84A"/>,
      grams: totals.carbs,
      kcal: carbCal,
      pct: carbPct,
      cssClass: 'carbs',
      barColor: 'var(--carb)',
      pctColor: '#FFA84A',
    },
    {
      key: 'prot',
      label: 'Protein',
      icon: <BicepsFlexed color='#6CAEFF'/>,
      grams: totals.protein,
      kcal: protCal,
      pct: protPct,
      cssClass: 'prot',
      barColor: 'var(--prot)',
      pctColor: '#6CAEFF',
    },
    {
      key: 'fat',
      label: 'Fat',
      icon: <Cuboid color='#FF6B6B'/>,
      grams: totals.fat,
      kcal: fatCal,
      pct: fatPct,
      cssClass: 'fat',
      barColor: 'var(--fat)',
      pctColor: '#FF6B6B',
    },
  ]

  return (
    <>
      {/* Three macro stat cards — rendered as a row in page.tsx */}
      {macros.map((m) => (
        <div key={m.key} className={`fusion-macro-card ${m.cssClass}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                {m.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                {m.grams.toFixed(1)}
                <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 2 }}>g</span>
              </p>
            </div>
            <span style={{ fontSize: 22 }} className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">{m.icon}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, m.pct)}%`,
                background: m.barColor,
                borderRadius: 10,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: m.pctColor, marginTop: 8 }}>
            {m.pct.toFixed(0)}% of calories
          </p>
        </div>
      ))}
    </>
  )
}