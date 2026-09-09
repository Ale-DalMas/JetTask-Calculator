import { useState } from 'react'
import { euro } from '../data/const'

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 88
const LABEL_RADIUS = 112
const GAP = 2 // px of surface left between slices, instead of a stroke

// Slots 1-3 of the categorical palette, in fixed order: the colour follows the
// entity, so a slice keeps its hue whatever its size.
const SLICES = [
  { key: 'net', label: 'Net salary', color: 'var(--series-1)' },
  { key: 'tax', label: 'IRPEF and regional surtax', color: 'var(--series-2)' },
  { key: 'inps', label: 'INPS contributions', color: 'var(--series-3)' },
]

const point = (radius, angle) =>
  `${(CENTER + radius * Math.cos(angle)).toFixed(2)} ${(CENTER + radius * Math.sin(angle)).toFixed(2)}`

const slicePath = (start, end) => {
  const largeArc = end - start > Math.PI ? 1 : 0

  return `M ${CENTER} ${CENTER} L ${point(RADIUS, start)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${point(RADIUS, end)} Z`
}

function Graphic({ breakdown }) {
  const [active, setActive] = useState(null)

  const parts = SLICES.map((slice) => ({
    ...slice,
    value: breakdown[slice.key],
  })).filter((slice) => slice.value > 0)

  const total = parts.reduce((sum, slice) => sum + slice.value, 0)
  if (total <= 0) return null

  // A 2px gap at the rim, expressed as the angle that spans it.
  const pad = GAP / RADIUS
  const arcs = []
  let cursor = -Math.PI / 2 // start at twelve o'clock

  for (const slice of parts) {
    const sweep = (slice.value / total) * Math.PI * 2
    // A slice too thin to hold the gap keeps its full sweep.
    const inset = sweep > pad * 2 ? pad / 2 : 0

    arcs.push({
      ...slice,
      share: slice.value / total,
      start: cursor + inset,
      end: cursor + sweep - inset,
      middle: cursor + sweep / 2,
    })
    cursor += sweep
  }

  return (
    <figure className="m-0 flex flex-col items-center gap-5 rounded-xl border border-line p-6 sm:flex-row sm:items-center sm:gap-8">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-56 w-56 shrink-0"
        role="img"
        aria-label={arcs
          .map((arc) => `${arc.label}: ${Math.round(arc.share * 100)}%`)
          .join(', ')}
      >
        {arcs.length === 1 ? (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            style={{ fill: arcs[0].color }}
          />
        ) : (
          arcs.map((arc) => (
            <path
              key={arc.key}
              d={slicePath(arc.start, arc.end)}
              style={{ fill: arc.color }}
              className={`transition-opacity ${
                active && active !== arc.key ? 'opacity-40' : 'opacity-100'
              }`}
              onMouseEnter={() => setActive(arc.key)}
              onMouseLeave={() => setActive(null)}
            >
              <title>{`${arc.label}: ${euro.format(arc.value)}`}</title>
            </path>
          ))
        )}

        {/* Direct labels ride just outside the rim, in ink rather than the
            series colour, so they stay readable on either surface. */}
        {arcs.map((arc) => (
          <text
            key={arc.key}
            x={CENTER + LABEL_RADIUS * Math.cos(arc.middle)}
            y={CENTER + LABEL_RADIUS * Math.sin(arc.middle)}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-body text-[15px]"
          >
            {Math.round(arc.share * 100)}%
          </text>
        ))}
      </svg>

      <figcaption className="w-full">
        <p className="mb-3 text-[15px] font-medium text-heading">
          Where your gross salary goes
        </p>

        <dl className="m-0 flex flex-col gap-2">
          {arcs.map((arc) => (
            <div
              key={arc.key}
              className={`flex items-baseline gap-2.5 transition-opacity ${
                active && active !== arc.key ? 'opacity-40' : 'opacity-100'
              }`}
              onMouseEnter={() => setActive(arc.key)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 translate-y-px rounded-full"
                style={{ background: arc.color }}
              />
              <dt className="text-[15px] text-body">{arc.label}</dt>
              <dd className="m-0 ml-auto text-[15px] font-medium text-heading tabular-nums">
                {euro.format(arc.value)}
              </dd>
            </div>
          ))}
        </dl>

        {breakdown.bonus > 0 && (
          <p className="mt-3 border-t border-line pt-3 text-[13px] text-body">
            Plus {euro.format(breakdown.bonus)} of supplementary allowance, paid
            on top of the gross salary.
          </p>
        )}
      </figcaption>
    </figure>
  )
}

export default Graphic
