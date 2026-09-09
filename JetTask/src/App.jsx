import { useState } from 'react'
import InfoGrid from './components/InfoGrid'
import Result from './components/Result'
import Header from './components/Header'
import ThemeToggle from './components/ThemeToggle'
import {
  REGIONS,
  ALIQUOTE,
  INPS_RATE,
  IRPEF_BRACKETS,
  DEDUCTION_BRACKETS,
  DEDUCTION_FIRST,
  DEDUCTION_BASE,
  DEDUCTION_EXTRA,
  DEDUCTION_MIN,
  BONUS_MAX,
  BONUS_THRESHOLD,
  DAYS_IN_YEAR,
} from './data/const'

// Gross IRPEF, charging each bracket rate only on the slice that falls in it.
const grossIrpef = (taxable) => {
  let tax = 0
  let floor = 0

  for (const { upTo, rate } of IRPEF_BRACKETS) {
    if (taxable <= floor) break
    tax += (Math.min(taxable, upTo) - floor) * rate
    floor = upTo
  }

  return tax
}

function App() {
  const [ral, setRal] = useState('')
  const [region, setRegion] = useState(null)
  const [month, setMonth] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [contractType, setContractType] = useState('Indeterminato')
  const [daysWorked, setDaysWorked] = useState(String(DAYS_IN_YEAR))
  const [bonusEnabled, setBonusEnabled] = useState(true)

  // Employee deduction: flat up to the first bracket, then phased out to zero
  // at the top of the third one, and in every case due only for the share of
  // the year actually worked. The floor is the exception - it is not scaled,
  // so it can lift a part-year deduction back up.
  const deduction = (taxable, contract, share) => {
    const { first, second, third } = DEDUCTION_BRACKETS

    if (taxable <= first) {
      return Math.max(DEDUCTION_MIN[contract], DEDUCTION_FIRST * share)
    }
    if (taxable <= second) {
      return (
        (DEDUCTION_BASE +
          ((second - taxable) / (second - first)) * DEDUCTION_EXTRA) *
        share
      )
    }
    if (taxable <= third) {
      return DEDUCTION_BASE * ((third - taxable) / (third - second)) * share
    }
    return 0
  }

  // Supplementary allowance: paid in full to those whose gross IRPEF clears
  // the threshold, then only for the deduction they cannot otherwise use.
  const supplementaryBonus = (taxable, deductionAmount, irpef, enabled, share) => {
    if (!enabled) return 0
    if (taxable <= DEDUCTION_BRACKETS.first) {
      return irpef > BONUS_THRESHOLD * share ? BONUS_MAX * share : 0
    }
    if (taxable <= DEDUCTION_BRACKETS.second) {
      return Math.max(0, Math.min(BONUS_MAX * share, deductionAmount - irpef))
    }
    return 0
  }

  const regionalAdditionalTax = (taxable) => {
    const rate = ALIQUOTE[REGIONS.indexOf(region)] ?? 0

    return (taxable * rate) / 100
  }

  const calculate = ({
    withBonus = bonusEnabled,
    contract = contractType,
    days = daysWorked,
  } = {}) => {
    const value = Number(ral.replace(',', '.'))

    if (!ral.trim() || !Number.isFinite(value) || value <= 0) {
      setError('Enter a valid gross salary greater than zero.')
      setResult(null)
      return
    }
    if (!region) {
      setError('Select the region where you live.')
      setResult(null)
      return
    }
    if (!month) {
      setError('Select how many months you are getting paid.')
      setResult(null)
      return
    }

    // An open-ended contract always covers the whole year, so the field is
    // ignored there and only a fixed-term one gets validated.
    const workedDays =
      contract === 'Indeterminato' ? DAYS_IN_YEAR : Number(days)

    if (
      !Number.isFinite(workedDays) ||
      workedDays <= 0 ||
      workedDays > DAYS_IN_YEAR
    ) {
      setError(
        `Enter the days worked in the year, between 1 and ${DAYS_IN_YEAR}.`,
      )
      setResult(null)
      return
    }

    setError('')

    const taxable = value * (1 - INPS_RATE)
    const irpef = grossIrpef(taxable)
    const share = workedDays / DAYS_IN_YEAR
    const deductionAmount = deduction(taxable, contract, share)
    // Deductions are a credit against IRPEF: they can zero it out, never turn
    // it into a refund. Whatever is left over is lost, which is exactly what
    // the supplementary allowance below gives back.
    const netIrpef = Math.max(0, irpef - deductionAmount)
    const regionalTax = regionalAdditionalTax(taxable)
    const bonusAmount = supplementaryBonus(
      taxable,
      deductionAmount,
      irpef,
      withBonus,
      share,
    )

    setResult({
      net: (taxable - netIrpef - regionalTax + bonusAmount) / month,
      gross: value,
      region,
      month,
      // How the gross splits up, for the chart. The three parts add up to the
      // gross exactly; the allowance is shown apart because it is paid on top
      // of it rather than carved out of it.
      breakdown: {
        inps: value - taxable,
        tax: netIrpef + regionalTax,
        net: taxable - netIrpef - regionalTax,
        bonus: bonusAmount,
      },
    })
  }

  // Flipping the switch re-runs the sums straight away, so the figures on
  // screen always match the controls above them.
  const toggleBonus = (enabled) => {
    setBonusEnabled(enabled)
  }

  const changeContract = (contract) => {
    // Going back to open-ended puts the field back to a full year, so what is
    // on screen matches what the calculation uses.
    const days =
      contract === 'Indeterminato' ? String(DAYS_IN_YEAR) : daysWorked

    setContractType(contract)
    setDaysWorked(days)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 pt-8 pb-16">

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <Header />
        </div>
        <ThemeToggle />
      </div>

      <InfoGrid
        ral={ral}
        setRal={setRal}
        region={region}
        setRegion={setRegion}
        month={month}
        setMonth={setMonth}
        bonusEnabled={bonusEnabled}
        setBonusEnabled={toggleBonus}
        contractType={contractType}
        setContractType={changeContract}
        daysWorked={daysWorked}
        setDaysWorked={setDaysWorked}
        daysLocked={contractType === 'Indeterminato'}
      />
      <button
        type="button"
        onClick={() => calculate()}
        className="cursor-pointer rounded-xl bg-accent px-5 py-3.5 text-[17px] font-medium text-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent dark:text-surface"
      >
        Calculate net salary
      </button>

      {error && (
        <p
          role="alert"
          className="text-center text-[15px] text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {result && (
        <Result 
        net={result.net} 
        gross={result.gross}
        month={result.month} 
        region={result.region} 
        breakdown={result.breakdown} />
      )}
    </main>
  )
}

export default App
