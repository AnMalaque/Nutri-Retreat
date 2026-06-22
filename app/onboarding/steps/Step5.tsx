'use client'
import { CheckCircle2, Edit2 } from 'lucide-react'

interface Step5Props {
  data: {
    first_name: string
    last_name: string
    age: string
    sex: string
    height_cm: string
    weight_kg: string
    activity_level: string
    goal: string
  }
  loading: boolean
  onSubmit: () => void
  onEdit: (step: number) => void
  onBack: () => void
}

const ACTIVITY_LEVEL_LABELS: Record<string, string> = {
  'Sedentary': 'Sedentary',
  'Light': 'Light Active',
  'Moderate': 'Moderate',
  'Active': 'Very Active',
  'VeryActive': 'Extremely Active',
}

export default function Step5({
  data,
  loading,
  onSubmit,
  onEdit,
  onBack,
}: Step5Props) {
  return (
    <div className="fusion-onboarding-step">
      <div className="fusion-step-header">
        <p className="fusion-step-number">Step 5 of 5</p>
        <h2 className="fusion-step-title">Review Your Info</h2>
        <p className="fusion-step-subtitle">
          Make sure everything looks good before we proceed
        </p>
      </div>

      <div className="fusion-step-form space-y-4">
        {/* Personal Info */}
        <div className="fusion-review-section">
          <div className="fusion-review-header">
            <h3 className="fusion-review-title">Personal Information</h3>
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="fusion-link-sm"
            >
              <Edit2 size={14} />
              Edit
            </button>
          </div>
          <div className="fusion-review-grid">
            <div className="fusion-review-item">
              <span className="fusion-review-label">Name</span>
              <span className="fusion-review-value">
                {data.first_name} {data.last_name}
              </span>
            </div>
            <div className="fusion-review-item">
              <span className="fusion-review-label">Age</span>
              <span className="fusion-review-value">{data.age} years</span>
            </div>
            <div className="fusion-review-item">
              <span className="fusion-review-label">Sex</span>
              <span className="fusion-review-value">{data.sex}</span>
            </div>
          </div>
        </div>

        {/* Measurements */}
        <div className="fusion-review-section">
          <div className="fusion-review-header">
            <h3 className="fusion-review-title">Body Measurements</h3>
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="fusion-link-sm"
            >
              <Edit2 size={14} />
              Edit
            </button>
          </div>
          <div className="fusion-review-grid">
            <div className="fusion-review-item">
              <span className="fusion-review-label">Height</span>
              <span className="fusion-review-value">{data.height_cm} cm</span>
            </div>
            <div className="fusion-review-item">
              <span className="fusion-review-label">Weight</span>
              <span className="fusion-review-value">{data.weight_kg} kg</span>
            </div>
          </div>
        </div>

        {/* Activity & Goal */}
        <div className="fusion-review-section">
          <div className="fusion-review-header">
            <h3 className="fusion-review-title">Goals & Lifestyle</h3>
            <button
              type="button"
              onClick={() => onEdit(3)}
              className="fusion-link-sm"
            >
              <Edit2 size={14} />
              Edit
            </button>
          </div>
          <div className="fusion-review-grid">
            <div className="fusion-review-item">
              <span className="fusion-review-label">Activity Level</span>
              <span className="fusion-review-value">
                {ACTIVITY_LEVEL_LABELS[data.activity_level]}
              </span>
            </div>
            <div className="fusion-review-item">
              <span className="fusion-review-label">Goal</span>
              <span className="fusion-review-value">{data.goal}</span>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="fusion-confirmation-box">
          <CheckCircle2 size={20} />
          <p>
            You&apos;re all set! We&apos;ll use this information to personalize
            your nutrition tracker.
          </p>
        </div>
      </div>

      <div className="fusion-button-group mt-6">
        <button onClick={onBack} className="fusion-btn-outline flex-1">
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="fusion-btn-solid flex-1"
        >
          {loading ? 'Setting up...' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  )
}