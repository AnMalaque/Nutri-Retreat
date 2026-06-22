'use client'
import { useState } from 'react'
import { User, Calendar, Users } from 'lucide-react'

interface Step1Props {
  data: {
    first_name: string
    last_name: string
    middle_name: string
    age: string
    sex: string
  }
  onChange: (field: string, value: string) => void
  onNext: () => void
}

export default function Step1({ data, onChange, onNext }: Step1Props) {
  const isComplete =
    data.first_name.trim() &&
    data.last_name.trim() &&
    data.age &&
    data.sex

  return (
    <div className="fusion-onboarding-step">
      <div className="fusion-step-header">
        <p className="fusion-step-number">Step 1 of 5</p>
        <h2 className="fusion-step-title">Let&apos;s Get Started</h2>
        <p className="fusion-step-subtitle">Tell us your basic information</p>
      </div>

      <form className="fusion-step-form space-y-4">
        {/* First Name */}
        <div className="relative">
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => onChange('first_name', e.target.value)}
            className="fusion-input pill icon-right"
            placeholder="First Name"
            autoComplete="given-name"
          />
          <span className="fusion-input-icon-r">
            <User size={16} />
          </span>
        </div>

        {/* Middle Name (Optional) */}
        <div className="relative">
          <input
            type="text"
            value={data.middle_name}
            onChange={(e) => onChange('middle_name', e.target.value)}
            className="fusion-input pill icon-right"
            placeholder="Middle Name (Optional)"
            autoComplete="middle-name"
          />
          <span className="fusion-input-icon-r">
            <User size={16} />
          </span>
        </div>

        {/* Last Name */}
        <div className="relative">
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => onChange('last_name', e.target.value)}
            className="fusion-input pill icon-right"
            placeholder="Last Name"
            autoComplete="family-name"
          />
          <span className="fusion-input-icon-r">
            <User size={16} />
          </span>
        </div>

        {/* Age */}
        <div className="relative">
          <input
            type="number"
            min="13"
            max="120"
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            className="fusion-input pill icon-right"
            placeholder="Age"
            autoComplete="off"
          />
          <span className="fusion-input-icon-r">
            <Calendar size={16} />
          </span>
        </div>

        {/* Sex Selection */}
        <div className="fusion-input-group">
          <label className="fusion-input-label">
            <Users size={16} />
            Sex
          </label>
          <div className="fusion-radio-group">
            {['Male', 'Female', 'Other'].map((option) => (
              <label key={option} className="fusion-radio-item">
                <input
                  type="radio"
                  name="sex"
                  value={option}
                  checked={data.sex === option}
                  onChange={(e) => onChange('sex', e.target.value)}
                  className="fusion-radio-input"
                />
                <span className="fusion-radio-label">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </form>

      <button
        onClick={onNext}
        disabled={!isComplete}
        className="fusion-btn-solid w-full mt-6"
      >
        Next Step →
      </button>
    </div>
  )
}