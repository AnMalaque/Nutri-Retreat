'use client'
import { useState } from 'react'
import { Ruler, Weight } from 'lucide-react'
import {
  Lightbulb
}from 'lucide-react'
interface Step2Props {
  data: {
    height_cm: string
    weight_kg: string
  }
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2({ data, onChange, onNext, onBack }: Step2Props) {
  const isComplete = data.height_cm && data.weight_kg

  return (
    <div className="fusion-onboarding-step">
      <div className="fusion-step-header">
        <p className="fusion-step-number">Step 2 of 5</p>
        <h2 className="fusion-step-title">Body Measurements</h2>
        <p className="fusion-step-subtitle">Help us track your progress</p>
      </div>

      <form className="fusion-step-form space-y-4">
        {/* Height */}
        <div className="relative">
          <input
            type="number"
            min="100"
            max="250"
            step="0.1"
            value={data.height_cm}
            onChange={(e) => onChange('height_cm', e.target.value)}
            className="fusion-input pill icon-right"
            placeholder="Height"
          />
          <span className="fusion-input-suffix">cm</span>
          <span className="fusion-input-icon-r">
            <Ruler size={16} />
          </span>
        </div>

        {/* Weight */}
        <div className="relative">
          <input
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={data.weight_kg}
            onChange={(e) => onChange('weight_kg', e.target.value)}
            className="fusion-input pill icon-right"
            placeholder="Weight"
          />
          <span className="fusion-input-suffix">kg</span>
          <span className="fusion-input-icon-r">
            <Weight size={16} />
          </span>
        </div>

        {/* Quick Reference */}
        <div className="fusion-info-box">
          <p className="text-xs opacity-70">
            <Lightbulb size={32} className="inline mr-2" /> <strong>Tip:</strong> Enter your current measurements. You can update these anytime.
          </p>
        </div>
      </form>

      <div className="fusion-button-group mt-6">
        <button onClick={onBack} className="fusion-btn-outline flex-1">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className="fusion-btn-solid flex-1"
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}