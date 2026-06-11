<div align="center">

# Ancie Nutri Retreat

### *A cozy Filipino food exchange tracker for mindful eating*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-FF6B35?style=flat-square)](LICENSE)

<br/>

> *Log your meals, understand your macros, and eat well — all through the lens of the Filipino Food Exchange List.*

<br/>

</div>

---

## What is this?

**Ancie Nutri Retreat** is a warm, web-based nutrition tracker built around the **Filipino Food Exchange List (FEL)** — a dietary reference system used by Filipino nutritionists and dietitians. Instead of guessing calories from scratch, you work with standardized food exchanges across five food groups: meat, rice, vegetables, fruit, and milk.

Track what you eat, see your macronutrient breakdown in real time, and understand your energy intake using the **Atwater general factors** (Carbs × 4, Protein × 4, Fat × 9).

---

## Features

- **Food Search** — search from a curated Filipino FEL database by food type
- **Live Macro Dashboard** — real-time carbohydrate, protein, and fat totals as you log
- **Energy Breakdown** — Atwater-calculated calorie panel per macronutrient
- **Food Log** — add, scale by grams/ml, and remove individual entries
- **Exchange Reference Panel** — quick-glance FEL exchange values for all food groups
- **Live Clock** — floating time pill localized to Philippine time (`en-PH`)
- **Parallax Background** — animated ambient blobs and dot-grid that breathe behind the cards
- **Soft Glassmorphic UI** — warm orange-accented design system with layered card depth

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + custom CSS design system |
| **Typography** | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| **Database** | [Supabase](https://supabase.com/) |
| **Icons** | Emoji + inline SVG |

---

##  Getting Started

### Prerequisites

- Node.js `≥ 18`
- npm or yarn

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/AnMalaque/ancie-nutri-retreat.git
cd ancie-nutri-retreat

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

---

##  Project Structure

```
ancie-nutri-retreat/
├── app/
│   ├── page.tsx           # Main dashboard — layout, state, hero card
│   ├── layout.tsx         # Root layout + font imports
│   └── globals.css        # Full design system (fusion-* tokens & classes)
├── components/
│   ├── FoodSearch.tsx     # Search input, food type tabs, portion selector
│   ├── FoodLog.tsx        # Scrollable log of added entries
│   └── MacroSummary.tsx   # Carb / Protein / Fat stat cards
└── public/
    └── ...                # Static assets
```

---

##  Food Exchange Reference

The tracker uses the standard Philippine FEL exchange values:

| Group | Exchange | Carbs | Protein | Fat | kcal |
|---|---|---|---|---|---|
|  Vegetable | 1 exchange | 3g | 1g | 0g | 16 |
|  Fruit | 1 exchange | 10g | 0g | 0g | 40 |
|  Rice A | 1 exchange | 23g | 0g | 0g | 92 |
|  Milk (Skim) | 1 exchange | 12g | 8g | 0g | 80 |
|  Meat (Low Fat) | 1 exchange | 0g | 8g | 1g | 41 |

*C = carbs · P = protein · F = fat (grams)*

---

## Philosophy

This project is built with calm and intention. No heavy dependencies, no bloated bundles — just a clean Next.js app that does one thing well: help you understand what you're eating, through a food system that's native to Filipino kitchens.

---

## MIT License

MIT © [AnMalaque](https://github.com/AnMalaque)

---

<div align="center">
  <sub>Made with 🧡 and a lot of rice exchanges</sub>
</div>
