import { useLayoutEffect, useRef } from 'react'
import { COLORS } from '../game/constants.js'

export default function PourStream({ pour, boardRef, lipRefs }) {
  const pathRef = useRef(null)

  useLayoutEffect(() => {
    const board = boardRef.current
    const source = lipRefs.current[pour.from]
    const dest = lipRefs.current[pour.to]
    const path = pathRef.current
    if (!board || !source || !dest || !path) return

    const origin = board.getBoundingClientRect()
    const s = source.getBoundingClientRect()
    const d = dest.getBoundingClientRect()
    const sx = s.left + s.width / 2 - origin.left
    const sy = s.top - origin.top
    const dx = d.left + d.width / 2 - origin.left
    const dy = d.top - origin.top + 18
    const arc = Math.min(sy, dy) - 40 - Math.abs(dx - sx) * 0.12
    path.setAttribute('d', `M ${sx} ${sy} Q ${(sx + dx) / 2} ${arc} ${dx} ${dy}`)
  }, [pour, boardRef, lipRefs])

  return (
    <svg className="pour-stream" aria-hidden="true">
      <path
        ref={pathRef}
        pathLength="1"
        style={{ stroke: COLORS[pour.color] }}
      />
    </svg>
  )
}
