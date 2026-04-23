
# Phase 1 — Foundation + Home Page

A high-fidelity Arabic-first (RTL) charitable association prototype. Phase 1 establishes the design system, global layout, accessibility & language infrastructure, dummy data, and a fully built **Home page** + **404 page**. Subsequent phases add inner pages, Surveys, and the Admin dashboard.

## Brand & Design System
- **Font:** IBM Plex Sans Arabic (Arabic) + Inter (English fallback)
- **Colors:** Primary green `#1B5E35`, Gold accent `#C5973A`, neutral whites/greys
- **Style:** Clean, modern, trustworthy nonprofit; generous spacing; rounded cards; soft shadows; subtle green/gold gradients
- **Tokens** wired through `index.css` + `tailwind.config.ts` (HSL semantic tokens, dark/high-contrast variants ready)
- **Defaults (placeholders, editable later):**
  - Name: «جمعية العطاء الخيرية»
  - Registration No.: «1234/2020»

## Global Infrastructure
- **RTL-first layout** — `<html dir="rtl" lang="ar">` by default
- **Language toggle (AR ⇄ EN)** — switches `dir`/`lang`, persists choice in localStorage; full translation dictionary for all Phase 1 strings
- **Floating Accessibility Toolbar** (bottom-corner FAB, expands to panel):
  - Text size A− / A / A+
  - High contrast mode
  - Dyslexia-friendly font (OpenDyslexic)
  - Reading guide (horizontal cursor bar)
  - Reset
  - All preferences saved to localStorage
- **Sticky top utility bar** — gold verification badge ✓ + registration number + language switcher
- **Main header** — logo, primary nav (Home, About, Programs, Governance, Media, Volunteer, Surveys, Contact), search icon, donate CTA
- **Full footer** — about blurb, quick links, legal links (privacy/terms/cookies/accessibility/sitemap), contact info, social icons, registration line, copyright
- **Page Feedback widget** — "هل كانت هذه الصفحة مفيدة؟" 👍 / 👎 + optional comment, stored in localStorage (reusable component for every page)
- **Breadcrumb component** (ready for inner pages)

## Home Page Sections
1. **Hero slider** — 3 slides (Swiper.js), full-width, image + headline + CTA, autoplay + pagination
2. **Impact statistics counters** — 4 animated counters (beneficiaries, programs, volunteers, years of service)
3. **About preview** — 2-column: image + intro text + "Learn more" link
4. **Programs grid** — 6 program cards with icon, title, short description
5. **News preview** — 3 latest news cards (image, date, title, excerpt)
6. **Partners carousel** — Swiper logo carousel (3 dummy partners, looped)
7. **Volunteer CTA banner** — green/gold gradient with "Join us" button
8. **Page feedback widget**
9. **Footer**

## Pages Delivered in Phase 1
- `/` Home (full build)
- `/404` (NotFound) — friendly Arabic message, search box, helpful links
- All other routes (`/about`, `/programs`, `/governance`, `/media`, `/volunteer`, `/contact`, `/surveys`, `/admin`, legal pages) wired into the router as **placeholder stubs** with breadcrumb + "Coming in next phase" notice — so navigation works end-to-end.

## Dummy Data (seeded into `src/data/`)
- 5 news articles, 6 programs, 4 board members, 3 partners, 8 volunteers, 3 contact messages, 2 surveys (1 active + 1 closed with results), 1 annual report, 2 policies — all in Arabic with English translations, ready for later phases.

## Tech & Folder Structure
- React 18 + TypeScript + Tailwind + React Router v6
- Swiper.js (hero + partners), Recharts & SweetAlert2 installed for later phases
- Lucide icons (Heroicons-equivalent, already available)
```
src/
├── components/        (Header, Footer, TopBar, AccessibilityToolbar,
│                       LanguageToggle, PageFeedback, Breadcrumb, …)
├── pages/             (Home, NotFound, stubs)
├── admin/             (placeholder for Phase 3)
├── hooks/             (useLanguage, useLocalStorage, useTranslation, useA11y)
├── data/              (news, programs, partners, board, surveys, …)
├── types/             (shared TS types)
└── i18n/              (ar.ts, en.ts dictionaries)
```
- Arabic comments throughout the codebase

## Phase 2 (next) — Inner pages: About, Programs, Governance, Media, Volunteer, Contact, Surveys (full builder + Recharts results), Search, Sitemap, Legal pages
## Phase 3 — Admin Dashboard (fake login + 13 sections)
