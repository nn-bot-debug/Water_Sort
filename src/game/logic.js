import { TUBE_CAPACITY } from './constants.js'

export function topColor(tube) {
  return tube.length ? tube[tube.length - 1] : null
}

export function topRun(tube) {
  const color = topColor(tube)
  if (color === null) return 0
  let run = 0
  for (let i = tube.length - 1; i >= 0 && tube[i] === color; i--) run++
  return run
}

export function pourSize(tubes, from, to) {
  if (from === to) return 0
  const source = tubes[from]
  const dest = tubes[to]
  if (!source || !dest || source.length === 0) return 0
  const free = TUBE_CAPACITY - dest.length
  if (free <= 0) return 0
  if (dest.length > 0 && topColor(dest) !== topColor(source)) return 0
  return Math.min(topRun(source), free)
}

export function canPour(tubes, from, to) {
  return pourSize(tubes, from, to) > 0
}

export function applyPour(tubes, from, to) {
  const count = pourSize(tubes, from, to)
  if (count === 0) return null
  const color = topColor(tubes[from])
  const next = tubes.map((tube) => tube.slice())
  next[from].length -= count
  for (let i = 0; i < count; i++) next[to].push(color)
  return { tubes: next, color, count }
}

export function isWon(tubes) {
  return tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0])),
  )
}

export function cloneTubes(tubes) {
  return tubes.map((tube) => tube.slice())
}
