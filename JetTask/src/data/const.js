export const REGIONS = [
  'Abruzzo',
  'Basilicata',
  'Calabria',
  'Campania',
  'Emilia-Romagna',
  'Friuli-Venezia Giulia',
  'Lazio',
  'Liguria',
  'Lombardia',
  'Marche',
  'Molise',
  'Piemonte',
  'Puglia',
  'Sardegna',
  'Sicilia',
  'Toscana',
  'Trentino-Alto Adige',
  'Umbria',
  "Valle d'Aosta",
  'Veneto',
]

export const MONTHS = [12, 13, 14]

export const ALIQUOTE = [
  1.73,
  1.73,
  1.23,
  2.03,
  2.03,
  2.03,
  1.23,
  2.93,
  2.31,
  1.72,
  1.70,
  2.43,
  2.75,
  1.23,
  1.23,
  1.68,
  1.23,
  1.68,
  1.23,
  1.23
]

// --- Tax parameters -------------------------------------------------------
// Every figure below is set by the yearly budget law: updating this block
// updates the whole calculation. These follow the three-bracket IRPEF reform
// in force since 2024. Check them against the year you want to model: the 2025
// budget law added further reliefs below 40.000 that are not implemented here.

// Employee social security contributions, subtracted from the gross salary.
export const INPS_RATE = 0.0919

// IRPEF brackets, applied progressively (each rate hits only its own slice).
export const IRPEF_BRACKETS = [
  { upTo: 28000, rate: 0.23 },
  { upTo: 50000, rate: 0.33 },
  { upTo: Infinity, rate: 0.43 },
]

// Employee tax deduction ("detrazione da lavoro dipendente").
export const DEDUCTION_BRACKETS = { first: 15000, second: 28000, third: 50000 }
export const DEDUCTION_FIRST = 1955 // flat amount up to the first bracket
export const DEDUCTION_BASE = 1910 // base amount of the two upper brackets
export const DEDUCTION_EXTRA = 1190 // extra amount phased out over the second
// Floor of the deduction, by contract type. Unlike the deduction itself this
// floor is NOT scaled down by the days worked, which is what makes a short
// fixed-term contract worth more than an open-ended one over the same days.
export const DEDUCTION_MIN = { Indeterminato: 690, Determinato: 1380 }
// Derived from the floors above, so the picker can never offer a contract type
// the calculation has no figure for.
export const CONTRACT_TYPES = Object.keys(DEDUCTION_MIN)

// Supplementary allowance ("trattamento integrativo", ex bonus Renzi).
export const BONUS_MAX = 1200
// It is due when the gross IRPEF exceeds the first-bracket deduction cut by
// 75 euro, so it also reaches those whose deduction wipes out their tax: for
// them the allowance is paid on top of the salary, not carved out of it.
export const BONUS_THRESHOLD = DEDUCTION_FIRST - 75

// The deduction and the allowance are both due for the days actually worked,
// so both are scaled by days / DAYS_IN_YEAR.
export const DAYS_IN_YEAR = 365

// Amounts stay in Italian format: euro sign, dot thousands, comma decimals.
export const euro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})
