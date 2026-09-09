import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

// Reading storage throws in some privacy modes, so every access is guarded and
// simply falls back to the operating system preference.
const readStoredTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

const systemPrefersDark = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches

function ThemeToggle() {
  const [dark, setDark] = useState(
    () => (readStoredTheme() ?? (systemPrefersDark() ? 'dark' : 'light')) === 'dark',
  )

  useEffect(() => {
    const theme = dark ? 'dark' : 'light'

    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Nothing to do: the choice just will not survive a reload.
    }
  }, [dark])

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <span className="text-[15px] font-medium text-heading">Dark theme</span>
      <label
        htmlFor="theme"
        className="relative block h-8 w-14 shrink-0 cursor-pointer rounded-full border border-line bg-chip transition-colors [-webkit-tap-highlight-color:transparent] has-checked:border-accent-line has-checked:bg-accent"
      >
        <input
          type="checkbox"
          id="theme"
          className="peer sr-only"
          checked={dark}
          onChange={(e) => setDark(e.target.checked)}
        />
        <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-surface transition-[inset-inline-start] peer-checked:start-6" />
      </label>
    </div>
  )
}

export default ThemeToggle
