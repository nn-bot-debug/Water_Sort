import { COLORS } from '../game/constants.js'

export default function LiquidSegment({ color, isTop, phase }) {
  const className = [
    'liquid',
    isTop && 'liquid--top',
    phase === 'leaving' && 'liquid--leaving',
    phase === 'arriving' && 'liquid--arriving',
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={className} style={{ '--liquid': COLORS[color] }} />
}
