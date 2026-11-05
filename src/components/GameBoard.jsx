import { useRef } from 'react'
import PourStream from './PourStream.jsx'
import Tube from './Tube.jsx'

const NAV_KEYS = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }

export default function GameBoard({
  tubes,
  selected,
  reject,
  pour,
  moves,
  status,
  onTap,
  onRejectEnd,
  onPourEnd,
}) {
  const boardRef = useRef(null)
  const buttonRefs = useRef([])
  const lipRefs = useRef([])

  function handleKeyDown(event) {
    const step = NAV_KEYS[event.key]
    if (!step) return
    const current = Number(event.target.dataset?.index)
    if (Number.isNaN(current)) return
    event.preventDefault()
    const next = (current + step + tubes.length) % tubes.length
    buttonRefs.current[next]?.focus()
  }

  const cols = tubes.length <= 6 ? tubes.length : Math.ceil(tubes.length / 2)
  const style = { '--cols': cols }
  if (pour) style['--pour-ms'] = `${pour.duration}ms`

  const className = [
    'board',
    status === 'pouring' && 'board--pouring',
    status === 'won' && 'board--won',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={boardRef}
      className={className}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {tubes.map((tube, i) => (
        <Tube
          key={i}
          index={i}
          tube={tube}
          selected={selected === i}
          rejected={reject?.index === i}
          pour={pour}
          disabled={status === 'won'}
          buttonRef={(el) => {
            buttonRefs.current[i] = el
          }}
          lipRef={(el) => {
            lipRefs.current[i] = el
          }}
          onTap={onTap}
          onRejectEnd={onRejectEnd}
          onArriveEnd={onPourEnd}
        />
      ))}
      {pour && (
        <PourStream
          key={`${pour.from}-${pour.to}-${moves}`}
          pour={pour}
          boardRef={boardRef}
          lipRefs={lipRefs}
        />
      )}
    </div>
  )
}
