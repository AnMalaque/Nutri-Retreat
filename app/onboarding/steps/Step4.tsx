'use client'
import { Target } from 'lucide-react'
import{
  TrendingUp,
  TrendingDown,
  Scale,
}from 'lucide-react'
interface Step4Props {
  data: {
    goal: string
  }
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

const GOALS = [
  {
    id: 'Lose Weight',
    label: 'Lose Weight',
    description: 'Create a calorie deficit to lose weight gradually',
    icons: <TrendingDown/>
  },
  {
    id: 'Maintain Weight',
    label: 'Maintain Weight',
    description: 'Keep your current weight and build healthy habits',
    icons: <Scale/>
  },
  {
    id: 'Gain Weight',
    label: 'Gain Weight',
    description: 'Create a calorie surplus to build muscle and gain',
    icons: <TrendingUp/>
  },
]

export default function Step4({ data, onChange, onNext, onBack }: Step4Props) {
  return (
    <div className="fusion-onboarding-step">
      <div className="fusion-step-header">
        <p className="fusion-step-number">Step 4 of 5</p>
        <h2 className="fusion-step-title">Your Goal</h2>
        <p className="fusion-step-subtitle">What&apos;s your health objective?</p>
      </div>

      <div className="fusion-step-form space-y-3">
        {GOALS.map((goal) => (
          <label
            key={goal.id}
            className={`fusion-card-selectable ${
              data.goal === goal.id ? 'selected' : ''
            }`}
          >
            <input
              type="radio"
              name="goal"
              value={goal.id}
              checked={data.goal === goal.id}
              onChange={(e) => onChange('goal', e.target.value)}
              className="sr-only"
            />
            <div className="fusion-card-select-content">
              <span className="text-2xl">{goal.icons}</span>
              <div className="flex-1">
                <p className="fusion-card-label">{goal.label}</p>
                <p className="fusion-card-description">{goal.description}</p>
              </div>
              <div className="fusion-card-check">
                <Target
                  size={20}
                  className={data.goal === goal.id ? 'visible' : 'invisible'}
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
          disabled={!data.goal}
          className="fusion-btn-solid flex-1"
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}