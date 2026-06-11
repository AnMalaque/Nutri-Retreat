'use client'

type FoodType = 'meat' | 'rice' | 'vegetable' | 'milk' | 'fruit'

export interface LogEntry {
  id: string
  food_type: FoodType
  food_name: string
  filipino_name: string
  grams: number
  base_weight: number
  carbohydrate_g: number
  protein_g: number
  fat_g: number
  calories: number
  unit: string
}

const TYPE_CONFIG: Record<FoodType, { emoji: string; color: string; label: string }> = {
  rice:      { emoji: '🍚', color: '#F9A03F', label: 'Rice' },
  meat:      { emoji: '🥩', color: '#E85555', label: 'Meat' },
  vegetable: { emoji: '🥦', color: '#4CAF82', label: 'Vegetable' },
  milk:      { emoji: '🥛', color: '#5B9BD5', label: 'Milk' },
  fruit:     { emoji: '🍎', color: '#9B59B6', label: 'Fruit' },
}

interface FoodLogProps {
  entries: LogEntry[]
  onRemove: (id: string) => void
}

export default function FoodLog({ entries, onRemove }: FoodLogProps) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🌾</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your food log is empty.</p>
        <p style={{ color: 'var(--text-light)', fontSize: 12, marginTop: 4 }}>
          Add foods to track your nutrition!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
      {entries.map((entry) => {
        const cfg = TYPE_CONFIG[entry.food_type]
        const exchanges = (entry.grams / entry.base_weight).toFixed(2)

        return (
          <div key={entry.id} className="fusion-log-row">
            {/* Icon */}
            <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{cfg.emoji}</span>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {entry.food_name}
                </span>
                <span
                  className="fusion-badge"
                  style={{
                    background: `${cfg.color}18`,
                    color: cfg.color,
                    border: `1.5px solid ${cfg.color}40`,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {entry.filipino_name} · {entry.grams}{entry.unit} ({exchanges} exc)
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#F9A03F' }}>
                  C {entry.carbohydrate_g.toFixed(1)}g
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#5B9BD5' }}>
                  P {entry.protein_g.toFixed(1)}g
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#E85555' }}>
                  F {entry.fat_g.toFixed(1)}g
                </span>
              </div>
            </div>

            {/* Calories + remove */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>
                {Math.round(entry.calories)}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal</p>
              <button
                onClick={() => onRemove(entry.id)}
                title="Remove"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: 'var(--text-light)',
                  marginTop: 4, padding: 0, transition: 'color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E85555')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-light)')}
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
