'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { upsertProfile, EMPTY_PROFILE } from '@/lib/services/profiles'
import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import Step4 from './steps/Step4'
import Step5 from './steps/Step5'
import './onboarding.css'
import type { Profile } from '@/lib/services/profiles'

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<Profile>(EMPTY_PROFILE)

  // Restore form data from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding_data')
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to restore form data:', err)
      }
    }
  }, [])

  // Save form data to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('onboarding_data', JSON.stringify(formData))
  }, [formData])

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleEdit = (targetStep: number) => {
    setStep(targetStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (loading || submitted) return
    
    setLoading(true)

    try {
      // Use existing upsertProfile function
      await upsertProfile(formData)

      // Clear session storage
      sessionStorage.removeItem('onboarding_data')
      
      // Mark as submitted to show success state
      setSubmitted(true)
      
      toast.success('Welcome! Your profile is all set up.')

      // Small delay to show success state, then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (err: any) {
      console.error('Onboarding error:', err)
      toast.error(err.message || 'Failed to complete onboarding')
      setLoading(false)
    }
  }

  // Show success state after submission
  if (submitted) {
    return (
      <main className="fusion-onboarding-wrap">
        <div className="fusion-onboarding-glow">
          <span />
          <span />
        </div>

        <div className="fusion-card fusion-onboarding-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            background: 'linear-gradient(135deg, rgb(255 200 100), rgb(200 150 255))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            All Set!
          </h2>
          <p style={{
            fontSize: 14,
            color: 'rgba(40, 40, 40, 0.6)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            Your profile has been saved successfully. Redirecting you to the dashboard...
          </p>
          <div style={{
            width: '100%',
            height: '3px',
            background: 'rgba(255, 200, 100, 0.1)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, rgba(255, 200, 100, 0.8), rgba(200, 150, 255, 0.8))',
              animation: 'loading 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="fusion-onboarding-wrap">
      {/* Background glow */}
      <div className="fusion-onboarding-glow">
        <span />
        <span />
      </div>

      {/* Progress bar */}
      <div className="fusion-progress-container">
        <div className="fusion-progress-bar">
          <div
            className="fusion-progress-fill"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Card container */}
      <div className="fusion-card fusion-onboarding-card">
        {step === 1 && (
          <Step1
            data={{
              first_name: formData.first_name as string,
              last_name: formData.last_name as string,
              middle_name: formData.middle_name as string,
              age: String(formData.age),
              sex: formData.sex as string,
            }}
            onChange={handleFieldChange}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <Step2
            data={{
              height_cm: String(formData.height_cm),
              weight_kg: String(formData.weight_kg),
            }}
            onChange={handleFieldChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <Step3
            data={{
              activity_level: formData.physical_activity_level as string,
            }}
            onChange={(field, value) => {
              if (field === 'activity_level') {
                handleFieldChange('physical_activity_level', value)
              }
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 4 && (
          <Step4
            data={{
              goal: formData.goal as string,
            }}
            onChange={handleFieldChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 5 && (
          <Step5
          data={{
            first_name: formData.first_name as string,
            last_name: formData.last_name as string,
            age: String(formData.age),
            sex: formData.sex as string,
            height_cm: String(formData.height_cm),
            weight_kg: String(formData.weight_kg),
            activity_level: formData.physical_activity_level as string,
            goal: formData.goal as string,
          }}
          loading={loading}
          onSubmit={handleSubmit}
          onEdit={handleEdit}
          onBack={handleBack}
        />
        )}
      </div>

      {/* Step indicator */}
      <p className="fusion-step-indicator">
        Step <span className="font-semibold">{step}</span> of{' '}
        <span className="font-semibold">5</span>
      </p>
    </main>
  )
}