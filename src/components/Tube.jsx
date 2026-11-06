import { COLORS, TUBE_CAPACITY } from '../game/constants.js'
import { topColor, topRun } from '../game/logic.js'
import LiquidSegment from './LiquidSegment.jsx'

function describe(index, tube) {
  if (tube.length === 0) return `Tube ${index + 1}, empty`
  return `Tube ${index + 1}, ${topColor(tube)} on top, ${tube.length} of ${TUBE_CAPACITY}`
}

export default function Tube({
  index,
  tube,
  selected,
  rejected,
  pour,
  disabled,
  buttonRef,
  lipRef,
  onTap,
  onRejectEnd,
  onArriveEnd,
}) {
  const isSource = pour?.from === index
  const isDest = pour?.to === index
  const complete = tube.length === TUBE_CAPACITY && topRun(tube) === TUBE_CAPACITY
  const accent = topColor(tube)

  const segments = tube.map((color, i) => ({
    key: i,
    color,
    phase: isSource && i >= tube.length - pour.count ? 'leaving' : null,
  }))
  if (isDest) {
    for (let i = 0; i < pour.count; i++) {
      segments.push({ key: `in-${i}`, color: pour.color, phase: 'arriving' })
    }
  }

  const className = [
    'tube',
    (selected || isSource) && 'tube--selected',
    rejected && 'tube--rejected',
    complete && 'tube--complete',
  ]
    .filter(Boolean)
    .join(' ')

  function handleAnimationEnd(event) {
    if (event.animationName === 'tube-shake') onRejectEnd()
    if (event.animationName === 'liquid-arrive') onArriveEnd()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      style={{ '--i': index, '--accent': accent ? COLORS[accent] : undefined }}
      aria-pressed={selected}
      aria-label={describe(index, tube)}
      data-index={index}
      disabled={disabled}
      onClick={() => onTap(index)}
      onAnimationEnd={handleAnimationEnd}
    >
      <span className="tube__body">
        <span ref={lipRef} className="tube__lip" />
        <span className="tube__glass">
          <span className="tube__liquid">
            {segments.map((segment, i) => (
              <LiquidSegment
                key={segment.key}
                color={segment.color}
                phase={segment.phase}
                isTop={i === segments.length - 1}
              />
            ))}
          </span>
        </span>
      </span>
    </button>
  )
}
