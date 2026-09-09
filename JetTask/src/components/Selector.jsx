function Selector({ selectorText, selectorTitle, options, value, setValue }) {
  return (
    <label htmlFor={selectorTitle} className="flex flex-col gap-3">
      <span className="text-[15px] font-medium text-heading">
        {selectorTitle}
      </span>
      {/* Same tokens as the other fields, and an explicit border and radius
          because the forms plugin styles selects with its own. */}
      <select
        name={selectorTitle}
        id={selectorTitle}
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value)}
        className="w-full cursor-pointer rounded-xl border border-line bg-chip px-4 py-3 text-[15px] text-heading transition-colors hover:border-accent-line focus:border-accent focus:ring-0"
      >
        <option value="" disabled>
          {selectorText}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default Selector
