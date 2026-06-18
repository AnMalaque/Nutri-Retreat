'use client'
import{
  BadgePlus,
  Sparkle,
  Scan,
  Bubbles,
  Search,
  Leaf,
  Wheat,
  Beef,
  Broccoli,
  Milk,
  Apple,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type FoodType = 'meat' | 'rice' | 'vegetable' | 'milk' | 'fruit'

interface FoodItem {
  id: number
  filipino_name: string
  english_name: string
  weight_g?: number
  amount_ml?: number
  household_measure?: string
  carbohydrate_g?: number
  protein_g?: number
  fat_g?: number
  calories: number
  fat_level?: string
  protein_level?: string
  category?: string
  preparation?: string
}

interface FoodSearchProps {
  onAddFood: (food: FoodItem, grams: number, type: FoodType) => void
}

const FOOD_TYPES: { value: FoodType; label: string; icon: React.ReactNode }[] = [
  { value: 'rice',      label: 'Rice',      icon: <Wheat /> },
  { value: 'meat',      label: 'Meat',      icon: <Beef /> },
  { value: 'vegetable', label: 'Vegetable', icon: <Broccoli /> },
  { value: 'milk',      label: 'Milk',      icon: <Milk /> },
  { value: 'fruit',     label: 'Fruit',     icon: <Apple /> },
]

const MEAT_FILTERS = [
  { value: '', label: 'All fat levels' },
  { value: 'low',    label: '🟢 Low Fat (41 kcal/exchange)' },
  { value: 'medium', label: '🟡 Medium Fat (86 kcal/exchange)' },
  { value: 'high',   label: '🔴 High Fat (122 kcal/exchange)' },
]

const RICE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'low',    label: 'Rice A – Low Protein (92 kcal)' },
  { value: 'medium', label: 'Rice B – Medium Protein (100 kcal)' },
  { value: 'high',   label: 'Rice C – High Protein (108 kcal)' },
]

const MILK_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'whole',   label: 'Whole (170 kcal/exchange)' },
  { value: 'low_fat', label: 'Low Fat (125 kcal/exchange)' },
  { value: 'non_fat', label: 'Non-Fat / Skim (80 kcal/exchange)' },
]
const VEGETABLE_CATEGORY_FILTERS = [
  { value: '', label: 'All Vegetables' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'processed', label: 'Processed' },
]

const VEGETABLE_PREPARATION_FILTERS = [
  { value: '', label: 'All Preparations' },
  { value: 'raw', label: 'Raw' },
  { value: 'cooked', label: 'Cooked' },
]

export default function FoodSearch({ onAddFood }: FoodSearchProps) {
  const [selectedType, setSelectedType] = useState<FoodType>('rice')
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('')
  const [vegPreparation, setVegPreparation] = useState('')
  const [foods, setFoods]               = useState<FoodItem[]>([])
  const [loading, setLoading]           = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams]               = useState('')
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchFoods = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: selectedType })
      if (search) params.set('search', search)
      if (filter) {
        if (selectedType === 'meat') {
          params.set('fat_level', filter)
        }

        if (selectedType === 'rice') {
          params.set('protein_level', filter)
        }

        if (selectedType === 'milk') {
          params.set('category', filter)
        }

        if (selectedType === 'vegetable') {
          params.set('category', filter)
        }
      }
      if (
        selectedType === 'vegetable' &&
        filter === 'fresh' &&
        vegPreparation
      ) {
        params.set('preparation', vegPreparation)
      }
      const res  = await fetch(`/api/foods?${params}`)
      const json = await res.json()
      setFoods(json.data || [])
    } catch {
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(fetchFoods, 300)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, search, filter, vegPreparation])

  useEffect(() => {
    setSelectedFood(null)
    setFilter('')
    setVegPreparation('')
    setSearch('')
  }, [selectedType])

  const handleAdd = () => {
    if (!selectedFood || !grams || parseFloat(grams) <= 0) return
    onAddFood(selectedFood, parseFloat(grams), selectedType)
    setSelectedFood(null)
    setGrams('')
  }

  const baseWeight  = selectedFood?.weight_g || selectedFood?.amount_ml || 0
  const gramsNum    = parseFloat(grams) || 0
  const ratio       = baseWeight > 0 ? gramsNum / baseWeight : 0
  const previewCal  = ratio * (selectedFood?.calories        || 0)
  const previewCarb = ratio * (selectedFood?.carbohydrate_g  || 0)
  const previewProt = ratio * (selectedFood?.protein_g       || 0)
  const previewFat  = ratio * (selectedFood?.fat_g           || 0)

    const subFilters =
  selectedType === 'meat'
    ? MEAT_FILTERS
    : selectedType === 'rice'
    ? RICE_FILTERS
    : selectedType === 'milk'
    ? MILK_FILTERS
    : selectedType === 'vegetable'
    ? VEGETABLE_CATEGORY_FILTERS
    : null
  return (
    <div className="fusion-card">
      <h2 className="fusion-card-title"><BadgePlus /> Add Food to Log</h2>

      {/* Type tabs */}
      <div className="fusion-tabs">
        {FOOD_TYPES.map((ft) => (
          <button
            key={ft.value}
            className={`fusion-tab ${selectedType === ft.value ? 'active' : ''}`}
            onClick={() => setSelectedType(ft.value)}
          >
            {ft.icon} {ft.label}
          </button>
        ))}
      </div>

      {/* Sub-filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  {subFilters && (
    <select
      className="fusion-select"
      value={filter}
      onChange={(e) => {
        setFilter(e.target.value)
        setVegPreparation('')
      }}
    >
      {subFilters.map((f) => (
        <option key={f.value} value={f.value}>
          {f.label}
        </option>
      ))}
    </select>
  )}

  {selectedType === 'vegetable' && filter === 'fresh' && (
    <select
      className="fusion-select"
      value={vegPreparation}
      onChange={(e) => setVegPreparation(e.target.value)}
    >
      <option value="">All Preparations</option>
      <option value="raw">Raw</option>
      <option value="cooked">Cooked</option>
    </select>
  )}
</div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: 14, pointerEvents: 'none',
        }}><Search /></span>
        <input
          type="text"
          className="fusion-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search Filipino or English name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Food list */}
      <div className="fusion-food-list">
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading foods… <Bubbles />
          </div>
        ) : foods.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No foods found. Try a different search! <Leaf />
          </div>
        ) : (
          foods.map((food) => {
            const base = food.weight_g || food.amount_ml || 0
            const unit = food.amount_ml ? 'ml' : 'g'
            const isSel = selectedFood?.id === food.id
            return (
              <div
                key={food.id}
                className={`fusion-food-row ${isSel ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedFood(food)
                  setGrams(String(food.weight_g || food.amount_ml || ''))
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isSel ? 'var(--accent)' : 'var(--text)' }}>
                    {food.english_name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {food.filipino_name}
                    {food.household_measure ? ` · ${food.household_measure}` : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{food.calories}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal/{base}{unit}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Gram input + preview */}
      {selectedFood && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.55)', borderRadius: 'var(--radius-xs)',
          padding: '12px 14px', marginBottom: 12,
          border: '1px solid rgba(255, 255, 255, 0.70)',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
            <Scan/> {selectedFood.english_name}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
              (1 exchange = {baseWeight}{selectedFood.amount_ml ? 'ml' : 'g'})
            </span>
          </p>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {selectedType === 'milk' ? 'Amount (ml):' : 'Grams (g):'}
            </span>
            <input
              type="number"
              className="fusion-input"
              style={{ maxWidth: 110 }}
              value={grams}
              min="0"
              step="1"
              placeholder={`e.g. ${baseWeight}`}
              onChange={(e) => setGrams(e.target.value)}
            />
          </div>

          {gramsNum > 0 && (
            <div className="fusion-preview">
              {[
                { label: 'Carbs',     val: previewCarb, unit: 'g',    color: '#F9A03F' },
                { label: 'Protein',   val: previewProt, unit: 'g',    color: '#5B9BD5' },
                { label: 'Fat',       val: previewFat,  unit: 'g',    color: '#E85555' },
                { label: 'Calories',  val: previewCal,  unit: 'kcal', color: 'var(--accent)' },
              ].map((n) => (
                <div key={n.label} className="fusion-preview-cell">
                  <div className="fusion-preview-val" style={{ color: n.color }}>
                    {n.unit === 'kcal' ? Math.round(n.val) : n.val.toFixed(1)}
                    <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>{n.unit}</span>
                  </div>
                  <div className="fusion-preview-unit">{n.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        className="fusion-btn"
        style={{ width: '100%' }}
        onClick={handleAdd}
        disabled={!selectedFood || !grams || parseFloat(grams) <= 0}
      >
        <Sparkle /> Add to Log
      </button>
    </div>
  )
}