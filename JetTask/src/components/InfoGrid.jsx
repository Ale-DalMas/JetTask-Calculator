import { REGIONS, MONTHS, CONTRACT_TYPES, DAYS_IN_YEAR } from '../data/const'
import Selector from './Selector'

// @tailwindcss/forms gives every input its own border, square corners and
// padding. These hand the look back to the rounded container the input sits in,
// so the field reads as one control instead of a box inside a box.
const bareInput =
  'w-full min-w-0 border-0 bg-transparent p-0 font-mono text-xl font-medium text-heading outline-none focus:ring-0 placeholder:text-body/50'

const chipBase =
  'cursor-pointer rounded-full border px-3.5 py-2 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const chipClass = (active) =>
  active
    ? `${chipBase} border-accent-line bg-accent-soft text-accent`
    : `${chipBase} border-line bg-chip text-heading hover:border-accent-line`

function InfoGrid({
  ral,
  setRal,
  region,
  setRegion,
  month,
  setMonth,
  bonusEnabled,
  setBonusEnabled,
  contractType,
  setContractType,
  daysWorked,
  setDaysWorked,
  daysLocked,
}) {
  return (
    <div className="flex flex-col gap-7">
      <RalInput ral={ral} setRal={setRal} />
      <div className="flex gap-2">
        <div className="w-2/3 h-full"><RegionSelector region={region} setRegion={setRegion} /></div>
        <div className="w-1/3 h-full"><MonthSelector month={month} setMonth={setMonth} /></div>
      </div>


      {/* Equal-height columns, each centring its control on both axes. */}
      <div className="flex w-full gap-2">
        <div className="flex w-1/4 flex-col items-center justify-center">
          <BonusToggle
            bonusEnabled={bonusEnabled}
            setBonusEnabled={setBonusEnabled}
          />
        </div>
        <div className="flex w-2/4 flex-col items-center justify-center">
          <RadioGroup
            legend="Contract type"
            name="contractType"
            options={CONTRACT_TYPES}
            value={contractType}
            setValue={setContractType}
          />
        </div>
        <div className="flex w-1/4 flex-col items-center justify-center">
          <DaysInput
            daysWorked={daysWorked}
            setDaysWorked={setDaysWorked}
            daysLocked={daysLocked}
          />
        </div>
      </div>
    </div>
  )
}

function RalInput({ ral, setRal }) {
  return (
    <section className="flex flex-col gap-3">
      <label htmlFor="ral" className="text-[15px] font-medium text-heading">
        Gross annual salary (RAL)
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 transition-colors focus-within:border-accent">
        <span aria-hidden="true" className="font-mono text-body">
          €
        </span>
        <input
          id="ral"
          type="number"
          inputMode="decimal"
          min="0"
          step="100"
          placeholder="30000"
          value={ral}
          onChange={(e) => setRal(e.target.value)}
          className={bareInput}
        />
      </div>
    </section>
  )
}


function DaysInput({ daysWorked, setDaysWorked, daysLocked }) {
  return (
    <section
      className={`flex w-full flex-col gap-3 ${daysLocked ? 'opacity-55' : ''}`}
    >
      <label htmlFor="days" className="text-[15px] font-medium text-heading">
        Working days
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 transition-colors focus-within:border-accent">
        <input
          id="days"
          type="number"
          inputMode="numeric"
          min="1"
          max={DAYS_IN_YEAR}
          step="1"
          placeholder={DAYS_IN_YEAR}
          value={daysWorked}
          disabled={daysLocked}
          onChange={(e) => setDaysWorked(e.target.value)}
          className={`${bareInput} disabled:cursor-not-allowed`}
        />
      </div>
    </section>
  )
}

function RegionSelector({ region, setRegion }) {
  return (
    <Selector
      selectorText={"Select your region"}
      selectorTitle="Region"
      options={REGIONS}
      value={region}
      setValue={setRegion}
    />
  )
}

function MonthSelector({ month, setMonth }) {
  return (
    <Selector
      selectorText={"Select your month"}
      selectorTitle="Months"
      options={MONTHS}
      value={month}
      setValue={setMonth}
    />
  )
}

function BonusToggle({ bonusEnabled, setBonusEnabled }) {
  return (
    <div className="flex flex-col items-center gap-2">

      <span className="text-[15px] font-medium text-heading">
        Include "Renzi" Bonus
      </span>
      <label
        htmlFor="bonus"
        className="relative block h-8 w-14 shrink-0 cursor-pointer rounded-full border border-line bg-chip transition-colors [-webkit-tap-highlight-color:transparent] has-checked:border-accent-line has-checked:bg-accent"
      >
        <input
          type="checkbox"
          id="bonus"
          className="peer sr-only"
          checked={bonusEnabled}
          onChange={(e) => setBonusEnabled(e.target.checked)}
        />
        <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-surface transition-[inset-inline-start] peer-checked:start-6" />
      </label>


    </div>
  )
}

function RadioGroup({ legend, name, options, value, setValue }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[15px] font-medium text-heading">
        {legend}
      </legend>

      {options.map((option) => (
        <label
          key={option}
          htmlFor={`${name}-${option}`}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-chip p-3 text-[15px] text-heading transition-colors hover:border-accent-line has-checked:border-accent-line has-checked:bg-accent-soft has-checked:text-accent"
        >
          {option}

          <input
            type="radio"
            name={name}
            id={`${name}-${option}`}
            value={option}
            checked={value === option}
            onChange={() => setValue(option)}
            className="size-5 accent-accent"
          />
        </label>
      ))}
    </fieldset>
  )
}

export default InfoGrid
