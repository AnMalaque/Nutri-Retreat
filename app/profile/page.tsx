'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import NutriDropdown from '@/components/NutriDropdown'
import type { DropdownOption } from '@/components/NutriDropdown'
import AuthGuard from '@/components/AuthGuard'
import { getProfile, upsertProfile, EMPTY_PROFILE } from '@/lib/services/profiles'
import type { Profile } from '@/lib/services/profiles'
import {
  User, Save, X,
  Ruler, Stethoscope, Dumbbell, Wheat,
} from 'lucide-react'

// ── Preset options ─────────────────────────────────────────────────────────
const PRESETS = {
  sex: [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ] as DropdownOption[],

  physical_activity_level: [
    { value: 'Sedentary', label: 'Sedentary' },
    { value: 'Lightly Active', label: 'Lightly Active' },
    { value: 'Moderately Active', label: 'Moderately Active' },
    { value: 'Very Active', label: 'Very Active' },
    { value: 'Extra Active', label: 'Extra Active' },
  ] as DropdownOption[],

  sleep_pattern: [
    { value: 'Less than 5 hrs', label: 'Less than 5 hrs' },
    { value: '5–6 hrs', label: '5–6 hrs' },
    { value: '6–7 hrs', label: '6–7 hrs' },
    { value: '7–8 hrs', label: '7–8 hrs' },
    { value: 'More than 8 hrs', label: 'More than 8 hrs' },
  ] as DropdownOption[],

  occupation: [
    { value: 'Student', label: 'Student' },
    { value: 'Office Worker', label: 'Office Worker' },
    { value: 'Healthcare Professional', label: 'Healthcare Professional' },
    { value: 'Teacher / Educator', label: 'Teacher / Educator' },
    { value: 'Engineer / Technician', label: 'Engineer / Technician' },
    { value: 'Driver / Courier', label: 'Driver / Courier' },
    { value: 'Construction / Laborer', label: 'Construction / Laborer' },
    { value: 'Retail / Sales', label: 'Retail / Sales' },
    { value: 'Food Service', label: 'Food Service' },
    { value: 'Farmer / Agriculture', label: 'Farmer / Agriculture' },
    { value: 'Business Owner', label: 'Business Owner' },
    { value: 'Freelancer / Remote Worker', label: 'Freelancer / Remote Worker' },
    { value: 'Homemaker', label: 'Homemaker' },
    { value: 'Military / Police / Security', label: 'Military / Police / Security' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Unemployed', label: 'Unemployed' },
  ] as DropdownOption[],

  medical_conditions: [
    'Hypertension', 'Type 1 Diabetes', 'Type 2 Diabetes', 'Asthma',
    'Chronic Kidney Disease', 'Heart Disease', 'Stroke', 'Cancer',
    'Thyroid Disorder', 'GERD / Acid Reflux', 'Arthritis', 'Osteoporosis',
    'Anemia', 'Depression', 'Anxiety', 'PCOS', 'Gout', 'Fatty Liver Disease',
    'High Cholesterol', 'None',
  ],

  medications: [
    'Amlodipine', 'Losartan', 'Metformin', 'Insulin', 'Atorvastatin',
    'Omeprazole', 'Aspirin', 'Furosemide', 'Salbutamol', 'Levothyroxine',
    'Prednisone', 'Metoprolol', 'Lisinopril', 'Glimepiride', 'Allopurinol',
    'Vitamin D', 'Iron Supplement', 'Calcium Supplement', 'Multivitamins', 'None',
  ],

  allergies: [
    'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Eggs', 'Milk / Dairy',
    'Wheat / Gluten', 'Soy', 'Sesame', 'Sulfites', 'Penicillin',
    'NSAIDs (e.g. Ibuprofen)', 'Aspirin', 'Latex', 'Dust Mites',
    'Pollen', 'Mold', 'Animal Dander', 'Insect Venom', 'None',
  ],

  dietary_restrictions: [
    'Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher',
    'Gluten-Free', 'Dairy-Free', 'Low Sodium', 'Low Sugar', 'Low Fat',
    'Low Carb / Keto', 'High Protein', 'Diabetic Diet', 'Renal Diet',
    'Low Purine (Gout Diet)', 'None',
  ],

  family_health_history: [
    'Hypertension', 'Type 2 Diabetes', 'Heart Disease', 'Stroke',
    'Cancer', 'High Cholesterol', 'Obesity', 'Asthma', 'Kidney Disease',
    'Thyroid Disorder', 'Mental Illness', "Alzheimer's / Dementia",
    'Osteoporosis', 'Gout', 'PCOS', 'None',
  ],
}

// ── Helpers to convert string[] to DropdownOption[] ────────────────────────
function toOptions(arr: string[]): DropdownOption[] {
  return arr.map(s => ({ value: s, label: s }))
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 16, paddingBottom: 10,
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
  border: '1.5px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      type="text" value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  )
}

function NumberInput({ value, onChange, placeholder }: {
  value: number | ''; onChange: (v: number | '') => void; placeholder?: string
}) {
  return (
    <input
      type="number" value={value} placeholder={placeholder} min={0}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      style={inputStyle}
    />
  )
}

// ── TagSelect — uses NutriDropdown for the add picker ─────────────────────
function TagSelect({ value, onChange, options, placeholder }: {
  value: string[]
  onChange: (v: string[]) => void
  options: string[]
  placeholder?: string
}) {
  const available = options.filter(o => !value.includes(o))
  const remove = (opt: string) => onChange(value.filter(v => v !== opt))

  const dropdownOptions: DropdownOption[] = [
    { value: '', label: placeholder ?? 'Add…', disabled: true },
    ...toOptions(available),
  ]

  const handleAdd = (selected: string) => {
    if (!selected || value.includes(selected)) return
    onChange([...value, selected])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Selected tags */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map(tag => (
            <span key={tag} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600,
              background: 'rgba(201,173,127,0.18)', color: 'var(--accent)',
              border: '1.5px solid rgba(201,173,127,0.4)',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {tag}
              <button
                onClick={() => remove(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                type="button"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* NutriDropdown picker — resets to '' after selection */}
      {available.length > 0 && (
        <NutriDropdown
          options={toOptions(available)}
          value=""
          onChange={v => { handleAdd(v) }}
          placeholder={placeholder ?? 'Add…'}
        />
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const [form,    setForm]    = useState<Profile>(EMPTY_PROFILE)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    getProfile()
      .then(p => { if (p) setForm(p) })
      .catch(e => setError(e?.message))
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError(null)
    try {
      await upsertProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const heroInitial = form.first_name?.trim()?.[0]?.toUpperCase() || '?'

  const bmi = (form.weight_kg !== '' && form.height_cm !== '' && Number(form.height_cm) > 0)
    ? (Number(form.weight_kg) / Math.pow(Number(form.height_cm) / 100, 2)).toFixed(1)
    : null

  const bmiLabel = bmi
    ? Number(bmi) < 18.5 ? 'Underweight'
    : Number(bmi) < 25   ? 'Normal'
    : Number(bmi) < 30   ? 'Overweight'
    : 'Obese'
    : null

  const bmiColor = bmiLabel === 'Normal'      ? '#7BAD6E'
    : bmiLabel === 'Underweight'              ? '#5B9BD5'
    : bmiLabel === 'Overweight'               ? '#F9A03F'
    : bmiLabel === 'Obese'                    ? '#E85555'
    : 'var(--text-muted)'

  return (
    <div className="fusion-layout">
      <Sidebar activePage="profile" />

      <div className="fusion-main">
        <main style={{ padding: '28px 28px', maxWidth: 900, margin: '0 auto' }}>

          {/* HERO */}
          <div className="fusion-hero" style={{ marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #C9AD7F, #A67C5B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff',
              userSelect: 'none', zIndex: 1,
            }}>
              {heroInitial}
            </div>
            <div style={{ zIndex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: 'var(--text)' }}>My Profile</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                Personal health information · Used to personalize your nutrition plan
              </p>
            </div>
            <div style={{ marginLeft: 'auto', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              {saved && <span style={{ fontSize: 12, color: '#7BAD6E', fontWeight: 600 }}>✓ Saved</span>}
              <button
                className="fusion-btn"
                style={{ padding: '9px 20px', opacity: saving ? 0.6 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={14} /> {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(232,85,85,0.1)', color: '#E85555', fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="fusion-card" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading profile…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* PERSONAL INFO */}
              <div className="fusion-card">
                <SectionHeader icon={<User size={16} />} title="Personal Information" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <Field label="First Name">
                    <TextInput value={form.first_name} onChange={v => set('first_name', v)} placeholder="Juan" />
                  </Field>
                  <Field label="Middle Name">
                    <TextInput value={form.middle_name} onChange={v => set('middle_name', v)} placeholder="dela" />
                  </Field>
                  <Field label="Last Name">
                    <TextInput value={form.last_name} onChange={v => set('last_name', v)} placeholder="Cruz" />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
                  <Field label="Age">
                    <NumberInput value={form.age} onChange={v => set('age', v)} placeholder="25" />
                  </Field>
                  <Field label="Sex">
                    <NutriDropdown
                      options={PRESETS.sex}
                      value={form.sex}
                      onChange={v => set('sex', v)}
                      placeholder="Select sex"
                    />
                  </Field>
                  <Field label="Occupation">
                    <NutriDropdown
                      options={PRESETS.occupation}
                      value={form.occupation}
                      onChange={v => set('occupation', v)}
                      placeholder="Select occupation"
                    />
                  </Field>
                </div>
              </div>

              {/* BODY MEASUREMENTS */}
              <div className="fusion-card">
                <SectionHeader icon={<Ruler size={16} />} title="Body Measurements" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <Field label="Height (cm)">
                    <NumberInput value={form.height_cm} onChange={v => set('height_cm', v)} placeholder="165" />
                  </Field>
                  <Field label="Weight (kg)">
                    <NumberInput value={form.weight_kg} onChange={v => set('weight_kg', v)} placeholder="60" />
                  </Field>
                  <Field label="BMI (auto-calculated)">
                    <div style={{
                      ...inputStyle,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(246,247,221,0.3)',
                    }}>
                      {bmi ? (
                        <>
                          <span style={{ fontWeight: 700, fontSize: 18, color: bmiColor }}>{bmi}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: bmiColor,
                            background: `${bmiColor}18`, border: `1.5px solid ${bmiColor}40`,
                            padding: '2px 10px', borderRadius: 20,
                          }}>{bmiLabel}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Enter height & weight</span>
                      )}
                    </div>
                  </Field>
                </div>
              </div>

              {/* LIFESTYLE */}
              <div className="fusion-card">
                <SectionHeader icon={<Dumbbell size={16} />} title="Lifestyle" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Physical Activity Level">
                    <NutriDropdown
                      options={PRESETS.physical_activity_level}
                      value={form.physical_activity_level}
                      onChange={v => set('physical_activity_level', v)}
                      placeholder="Select activity level"
                    />
                  </Field>
                  <Field label="Sleep Pattern (hours/night)">
                    <NutriDropdown
                      options={PRESETS.sleep_pattern}
                      value={form.sleep_pattern}
                      onChange={v => set('sleep_pattern', v)}
                      placeholder="Select sleep pattern"
                    />
                  </Field>
                </div>
              </div>

              {/* DIETARY */}
              <div className="fusion-card">
                <SectionHeader icon={<Wheat size={16} />} title="Dietary Information" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Dietary Restrictions">
                    <TagSelect
                      value={form.dietary_restrictions}
                      onChange={v => set('dietary_restrictions', v)}
                      options={PRESETS.dietary_restrictions}
                      placeholder="Add restriction…"
                    />
                  </Field>
                  <Field label="Allergies">
                    <TagSelect
                      value={form.allergies}
                      onChange={v => set('allergies', v)}
                      options={PRESETS.allergies}
                      placeholder="Add allergy…"
                    />
                  </Field>
                </div>
              </div>

              {/* MEDICAL */}
              <div className="fusion-card">
                <SectionHeader icon={<Stethoscope size={16} />} title="Medical Information" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Medical Conditions">
                      <TagSelect
                        value={form.medical_conditions}
                        onChange={v => set('medical_conditions', v)}
                        options={PRESETS.medical_conditions}
                        placeholder="Add condition…"
                      />
                    </Field>
                    <Field label="Current Medications">
                      <TagSelect
                        value={form.medications}
                        onChange={v => set('medications', v)}
                        options={PRESETS.medications}
                        placeholder="Add medication…"
                      />
                    </Field>
                  </div>
                  <Field label="Family Health History">
                    <TagSelect
                      value={form.family_health_history}
                      onChange={v => set('family_health_history', v)}
                      options={PRESETS.family_health_history}
                      placeholder="Add condition…"
                    />
                  </Field>
                </div>
              </div>

              {/* BOTTOM SAVE */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 8 }}>
                {saved && (
                  <span style={{ fontSize: 12, color: '#7BAD6E', fontWeight: 600, alignSelf: 'center' }}>
                    ✓ Profile saved successfully
                  </span>
                )}
                <button
                  className="fusion-btn"
                  style={{ padding: '10px 28px', opacity: saving ? 0.6 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={14} /> {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>

            </div>
          )}
        </main>

        <footer style={{
          textAlign: 'center', padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          Nutri Retreat · Filipino Food Exchange Lists · Atwater general factors (C×4, P×4, F×9)
        </footer>
      </div>
    </div>
  )
}