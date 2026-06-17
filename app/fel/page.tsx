'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Hamburger,
  History,
  Target,
  Search,
  Beef,
  Wheat,
  Broccoli,
  Milk,
  Apple,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  Flame,
} from 'lucide-react'

type FoodType = 'meat' | 'rice' | 'vegetable' | 'milk' | 'fruit'
type SortKey = 'english_name' | 'calories' | 'carbohydrate_g' | 'protein_g' | 'fat_g'
type SortDir = 'asc' | 'desc'

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
}

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/', active: false },
  { icon: <Hamburger size={20} />, label: 'FEL', href: '/fel', active: true },
  { icon: <History size={20} />, label: 'Food History', href: '/history', active: false },
  { icon: <Target size={20} />, label: 'Meal Goals', href: '#', active: false },
]

const FOOD_TABS: { value: FoodType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'rice',      label: 'Rice',      icon: <Wheat size={15} />,    color: '#C9AD7F' },
  { value: 'meat',      label: 'Meat',      icon: <Beef size={15} />,     color: '#E85555' },
  { value: 'vegetable', label: 'Vegetable', icon: <Broccoli size={15} />, color: '#7BAD6E' },
  { value: 'milk',      label: 'Milk',      icon: <Milk size={15} />,     color: '#5B9BD5' },
  { value: 'fruit',     label: 'Fruit',     icon: <Apple size={15} />,    color: '#F9A03F' },
]

const MEAT_FILTERS = [
  { value: '', label: 'All Fat Levels' },
  { value: 'low',    label: 'Low Fat' },
  { value: 'medium', label: 'Medium Fat' },
  { value: 'high',   label: 'High Fat' },
]

const RICE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'low',    label: 'Rice A – Low Protein' },
  { value: 'medium', label: 'Rice B – Medium Protein' },
  { value: 'high',   label: 'Rice C – High Protein' },
]

const MILK_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'whole',   label: 'Whole Milk' },
  { value: 'low_fat', label: 'Low Fat' },
  { value: 'non_fat', label: 'Non-Fat / Skim' },
]

const PAGE_SIZES = [10, 25, 50, 100]

const FAT_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low Fat',    color: '#4caf50', bg: 'rgba(76,175,80,0.12)'   },
  medium: { label: 'Med Fat',    color: '#F9A03F', bg: 'rgba(249,160,63,0.12)'  },
  high:   { label: 'High Fat',   color: '#E85555', bg: 'rgba(232,85,85,0.12)'   },
}

const PROT_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Rice A',     color: '#7BAD6E', bg: 'rgba(123,173,110,0.12)' },
  medium: { label: 'Rice B',     color: '#F9A03F', bg: 'rgba(249,160,63,0.12)'  },
  high:   { label: 'Rice C',     color: '#E85555', bg: 'rgba(232,85,85,0.12)'   },
}

const MILK_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  whole:   { label: 'Whole',    color: '#5B9BD5', bg: 'rgba(91,155,213,0.12)'  },
  low_fat: { label: 'Low Fat',  color: '#7BAD6E', bg: 'rgba(123,173,110,0.12)' },
  non_fat: { label: 'Skim',     color: '#C9AD7F', bg: 'rgba(201,173,127,0.12)' },
}

export default function FELPage() {
  const [activeType, setActiveType]   = useState<FoodType>('rice')
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('')
  const [foods, setFoods]             = useState<FoodItem[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [sortKey, setSortKey]         = useState<SortKey>('english_name')
  const [sortDir, setSortDir]         = useState<SortDir>('asc')
  const [page, setPage]               = useState(1)
  const [pageSize, setPageSize]       = useState(25)

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ type: activeType })
      if (search) params.set('search', search)
      if (filter) {
        if (activeType === 'meat') params.set('fat_level', filter)
        if (activeType === 'rice') params.set('protein_level', filter)
        if (activeType === 'milk') params.set('category', filter)
      }
      const res  = await fetch(`/api/foods?${params}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setFoods(json.data || [])
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch foods')
      setFoods([])
    } finally {
      setLoading(false)
    }
  }, [activeType, search, filter])

  useEffect(() => {
    const t = setTimeout(fetchFoods, 300)
    return () => clearTimeout(t)
  }, [fetchFoods])

  useEffect(() => {
    setFilter('')
    setSearch('')
    setPage(1)
  }, [activeType])

  const sorted = [...foods].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string' && typeof bv === 'string')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const subFilters =
    activeType === 'meat' ? MEAT_FILTERS :
    activeType === 'rice' ? RICE_FILTERS :
    activeType === 'milk' ? MILK_FILTERS : null

  const activeTab = FOOD_TABS.find(t => t.value === activeType)!

  const SortTh = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      style={{
        padding: '10px 14px',
        textAlign: col === 'english_name' ? 'left' : 'right',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 11,
        fontWeight: 600,
        color: sortKey === col ? 'var(--accent)' : 'var(--text-muted)',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(246,247,221,0.30)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <ArrowUpDown size={11} style={{ opacity: sortKey === col ? 1 : 0.35 }} />
      </span>
    </th>
  )

  return (
    <div className="fusion-layout">

      {/* SIDEBAR */}
      <aside className="fusion-sidebar">
        <div className="fusion-logo">
          <div className="fusion-logo-icon">A</div>
        </div>
        <nav className="fusion-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`fusion-nav-item ${item.active ? 'active' : ''}`}
              title={item.label}
              style={{ textDecoration: 'none' }}
            >
              <span className="fusion-nav-icon">{item.icon}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="fusion-main">
        <main style={{ padding: '28px 28px' }}>

          {/* PAGE HEADER */}
          <div className="fusion-hero" style={{ marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #C9AD7F, #A67C5B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, zIndex: 1,
            }}>
              <Hamburger size={28} color="#fff" />
            </div>
            <div style={{ zIndex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: 'var(--text)' }}>
                Food Exchange Lists
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                Filipino FEL Database · Browse &amp; explore all food items
              </p>
            </div>
            <div style={{ marginLeft: 'auto', zIndex: 1, flexShrink: 0, textAlign: 'right' }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                {foods.length}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {activeType} items
              </p>
            </div>
          </div>

          {/* FOOD TYPE TABS */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {FOOD_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveType(tab.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  borderRadius: 12,
                  border: activeType === tab.value
                    ? `1.5px solid ${tab.color}`
                    : '1.5px solid var(--border)',
                  background: activeType === tab.value
                    ? `rgba(${tab.value === 'rice' ? '201,173,127' : tab.value === 'meat' ? '232,85,85' : tab.value === 'vegetable' ? '123,173,110' : tab.value === 'milk' ? '91,155,213' : '249,160,63'},0.14)`
                    : 'rgba(246,247,221,0.30)',
                  color: activeType === tab.value ? tab.color : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* FILTERS ROW */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }}>
                <Search size={15} />
              </span>
              <input
                type="text"
                className="fusion-input"
                style={{ paddingLeft: 36 }}
                placeholder="Search Filipino or English name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Sub-filter */}
            {subFilters && (
              <select
                className="fusion-select"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ minWidth: 180 }}
              >
                {subFilters.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            )}

            {/* Page size */}
            <select
              className="fusion-select"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              style={{ minWidth: 100 }}
            >
              {PAGE_SIZES.map(s => (
                <option key={s} value={s}>Show {s}</option>
              ))}
            </select>
          </div>

          {/* TABLE CARD */}
          <div className="fusion-card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14,
              }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Loading {activeType} foods…
              </div>
            ) : error ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, padding: '60px 20px', color: '#E85555', fontSize: 14,
              }}>
                <AlertCircle size={28} />
                <span>{error}</span>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <SortTh col="english_name" label="Food Name" />
                        <th style={{
                          padding: '10px 14px', fontSize: 11, fontWeight: 600,
                          color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
                          background: 'rgba(246,247,221,0.30)', textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          Measure
                        </th>
                        {(activeType === 'meat' || activeType === 'rice' || activeType === 'milk') && (
                          <th style={{
                            padding: '10px 14px', fontSize: 11, fontWeight: 600,
                            color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
                            background: 'rgba(246,247,221,0.30)', textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            Category
                          </th>
                        )}
                        <SortTh col="carbohydrate_g" label="Carbs (g)" />
                        <SortTh col="protein_g" label="Protein (g)" />
                        <SortTh col="fat_g" label="Fat (g)" />
                        <SortTh col="calories" label="Calories" />
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{
                            padding: '48px 20px', textAlign: 'center',
                            color: 'var(--text-muted)', fontSize: 13,
                          }}>
                            No foods found. Try a different search or filter.
                          </td>
                        </tr>
                      ) : paginated.map((food, idx) => {
                        const unit = food.amount_ml ? 'ml' : 'g'
                        const baseAmt = food.weight_g || food.amount_ml || '—'

                        let badge: { label: string; color: string; bg: string } | null = null
                        if (activeType === 'meat' && food.fat_level)     badge = FAT_BADGE[food.fat_level] || null
                        if (activeType === 'rice' && food.protein_level) badge = PROT_BADGE[food.protein_level] || null
                        if (activeType === 'milk' && food.category)      badge = MILK_BADGE[food.category] || null

                        return (
                          <tr
                            key={food.id}
                            style={{
                              background: idx % 2 === 0
                                ? 'transparent'
                                : 'rgba(246,247,221,0.18)',
                              transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,173,127,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(246,247,221,0.18)')}
                          >
                            {/* Name */}
                            <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(222,207,172,0.25)' }}>
                              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                                {food.english_name}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {food.filipino_name}
                              </p>
                            </td>

                            {/* Measure */}
                            <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(222,207,172,0.25)', color: 'var(--text-muted)', fontSize: 12 }}>
                              {food.household_measure
                                ? <span>{food.household_measure}<br /><span style={{ fontSize: 11 }}>({baseAmt}{unit})</span></span>
                                : <span>{baseAmt}{unit}</span>
                              }
                            </td>

                            {/* Category badge */}
                            {(activeType === 'meat' || activeType === 'rice' || activeType === 'milk') && (
                              <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(222,207,172,0.25)' }}>
                                {badge ? (
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '3px 9px', borderRadius: 20,
                                    fontSize: 11, fontWeight: 600,
                                    color: badge.color, background: badge.bg,
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {badge.label}
                                  </span>
                                ) : '—'}
                              </td>
                            )}

                            {/* Macros */}
                            <td style={{ padding: '11px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.25)', fontFamily: 'monospace', fontSize: 13, color: '#F9A03F', fontWeight: 500 }}>
                              {food.carbohydrate_g != null ? food.carbohydrate_g.toFixed(1) : '—'}
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.25)', fontFamily: 'monospace', fontSize: 13, color: '#5B9BD5', fontWeight: 500 }}>
                              {food.protein_g != null ? food.protein_g.toFixed(1) : '—'}
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.25)', fontFamily: 'monospace', fontSize: 13, color: '#E85555', fontWeight: 500 }}>
                              {food.fat_g != null ? food.fat_g.toFixed(1) : '—'}
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right', borderBottom: '1px solid rgba(222,207,172,0.25)' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>
                                <Flame size={12} />
                                {Math.round(food.calories)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderTop: '1px solid var(--border)',
                  background: 'rgba(246,247,221,0.25)', flexWrap: 'wrap', gap: 8,
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length} items
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      className="fusion-btn-ghost"
                      style={{ padding: '5px 10px', fontSize: 13 }}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pg = i + 1
                      if (totalPages > 7) {
                        if (page <= 4) pg = i + 1
                        else if (page >= totalPages - 3) pg = totalPages - 6 + i
                        else pg = page - 3 + i
                      }
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: pg === page ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                            background: pg === page ? 'var(--accent-light)' : 'transparent',
                            color: pg === page ? 'var(--accent)' : 'var(--text-muted)',
                            fontSize: 13, fontWeight: pg === page ? 700 : 400,
                            cursor: 'pointer',
                          }}
                        >
                          {pg}
                        </button>
                      )
                    })}
                    <button
                      className="fusion-btn-ghost"
                      style={{ padding: '5px 10px', fontSize: 13 }}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LEGEND */}
          <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { color: '#F9A03F', label: 'Carbohydrates' },
              { color: '#5B9BD5', label: 'Protein' },
              { color: '#E85555', label: 'Fat' },
              { color: 'var(--accent)', label: 'Calories (kcal)' },
            ].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
          </div>

        </main>

        <footer style={{
          textAlign: 'center', padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
           Nutri Retreat · Filipino Food Exchange Lists · Atwater general factors (C×4, P×4, F×9)
        </footer>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}