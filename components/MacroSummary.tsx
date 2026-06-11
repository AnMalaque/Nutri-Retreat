'use client'

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
      emoji: '🌾',
      grams: totals.carbs,
      kcal: carbCal,
      pct: carbPct,
      cssClass: 'carbs',
      barColor: 'var(--carb)',
      pctColor: '#F9A03F',
    },
    {
      key: 'prot',
      label: 'Protein',
      emoji: '💪',
      grams: totals.protein,
      kcal: protCal,
      pct: protPct,
      cssClass: 'prot',
      barColor: 'var(--prot)',
      pctColor: '#5B9BD5',
    },
    {
      key: 'fat',
      label: 'Fat',
      emoji: '🧈',
      grams: totals.fat,
      kcal: fatCal,
      pct: fatPct,
      cssClass: 'fat',
      barColor: 'var(--fat)',
      pctColor: '#E85555',
    },
  ]

  return (
    <>
      {/* Three macro stat cards — rendered as a row in page.tsx */}
      {macros.map((m) => (
        <div key={m.key} className={`fusion-macro-card ${m.cssClass}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                {m.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                {m.grams.toFixed(1)}
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>g</span>
              </p>
            </div>
            <span style={{ fontSize: 22 }}>{m.emoji}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: '#F0F0F6', borderRadius: 10, overflow: 'hidden' }}>
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
          <p style={{ fontSize: 11, fontWeight: 600, color: m.pctColor, marginTop: 6 }}>
            {m.pct.toFixed(0)}% of calories
          </p>
        </div>
      ))}
    </>
  )
}
