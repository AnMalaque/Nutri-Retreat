'use client'
import {
  Armchair,
  Footprints,
  SportShoe,
  Zap,
  Flame,
}from 'lucide-react'
interface Step3Props {
  data: {
    activity_level: string
  }
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

const ACTIVITY_LEVELS = [
  {
    id: 'Sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    icons: <Armchair/>,
  },
  {
    id: 'Lightly Active',
    label: 'Lightly Active',
    description: 'Exercise 1-3 days/week',
    icons: <Footprints/>,
  },
  {
    id: 'Moderately Active',
    label: 'Moderately Active',
    description: 'Exercise 3-5 days/week',
    icons: <SportShoe/>,
  },
  {
    id: 'Very Active',
    label: 'Very Active',
    description: 'Exercise 6-7 days/week',
    icons: <Zap/>,
  },
  {
    id: 'Extra Active',
    label: 'Extra Active',
    description: 'Physical job or intense training',
    icons: <Flame/>,
  },
]

export default function Step3({ data, onChange, onNext, onBack }: Step3Props) {
  return (
    <div className="fusion-onboarding-step">
      <div className="fusion-step-header">
        <p className="fusion-step-number">Step 3 of 5</p>
        <h2 className="fusion-step-title">Activity Level</h2>
        <p className="fusion-step-subtitle">How active are you daily?</p>
      </div>

      <div className="fusion-step-form space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <label
            key={level.id}
            className={`fusion-card-selectable ${
              data.activity_level === level.id ? 'selected' : ''
            }`}
          >
            <input
              type="radio"
              name="activity_level"
              value={level.id}
              checked={data.activity_level === level.id}
              onChange={(e) => onChange('activity_level', e.target.value)}
              className="sr-only"
            />
            <div className="fusion-card-select-content">
              <span className="text-2xl">{level.icons}</span>
              <div className="flex-1">
                <p className="fusion-card-label">{level.label}</p>
                <p className="fusion-card-description">{level.description}</p>
              </div>
              <div className="fusion-card-check">
                <Zap
                  size={20}
                  className={data.activity_level === level.id ? 'visible' : 'invisible'}
                />
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="fusion-button-group mt-6">
        <button onClick={onBack} className="fusion-btn-outline flex-1">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!data.activity_level}
          className="fusion-btn-solid flex-1"
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}