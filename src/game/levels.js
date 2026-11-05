import { COLOR_IDS, TUBE_CAPACITY } from './constants.js'
import { applyPour, cloneTubes, isWon, pourSize, topRun } from './logic.js'

export const AUTHORED_LEVELS = [
  [
    ['crimson', 'cyan', 'crimson', 'cyan'],
    ['cyan', 'crimson', 'cyan', 'crimson'],
    [],
    [],
  ],
  [
    ['amber', 'crimson', 'cyan', 'amber'],
    ['cyan', 'amber', 'crimson', 'crimson'],
    ['crimson', 'cyan', 'amber', 'cyan'],
    [],
    [],
  ],
  [
    ['lime', 'crimson', 'amber', 'cyan'],
    ['amber', 'lime', 'cyan', 'crimson'],
    ['cyan', 'amber', 'crimson', 'lime'],
    ['crimson', 'cyan', 'lime', 'amber'],
    [],
    [],
  ],
  [
    ['violet', 'amber', 'cyan', 'crimson'],
    ['lime', 'violet', 'crimson', 'amber'],
    ['cyan', 'lime', 'amber', 'violet'],
    ['crimson', 'cyan', 'violet', 'lime'],
    ['amber', 'crimson', 'lime', 'cyan'],
    [],
    [],
  ],
]

const EMPTY_TUBES = 2
const SOLVER_NODE_LIMIT = 20000

function stateKey(tubes) {
  return tubes
    .map((tube) => tube.join(','))
    .sort()
    .join('|')
}

function isSortedTube(tube) {
  return tube.length === TUBE_CAPACITY && topRun(tube) === TUBE_CAPACITY
}

export function isSolvable(start) {
  const seen = new Set()
  const stack = [start]
  while (stack.length) {
    const tubes = stack.pop()
    if (isWon(tubes)) return true
    const key = stateKey(tubes)
    if (seen.has(key)) continue
    seen.add(key)
    if (seen.size > SOLVER_NODE_LIMIT) return false

    for (let from = 0; from < tubes.length; from++) {
      const source = tubes[from]
      if (source.length === 0 || isSortedTube(source)) continue
      for (let to = 0; to < tubes.length; to++) {
        if (pourSize(tubes, from, to) === 0) continue
        if (tubes[to].length === 0 && topRun(source) === source.length) continue
        stack.push(applyPour(tubes, from, to).tubes)
      }
    }
  }
  return false
}

function shuffle(items) {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function deal(colorCount) {
  const colors = COLOR_IDS.slice(0, colorCount)
  const units = shuffle(colors.flatMap((c) => Array(TUBE_CAPACITY).fill(c)))
  const tubes = []
  for (let i = 0; i < colorCount; i++) {
    tubes.push(units.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY))
  }
  for (let i = 0; i < EMPTY_TUBES; i++) tubes.push([])
  return tubes
}

export function generateLevel(colorCount) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const tubes = deal(colorCount)
    if (tubes.some(isSortedTube)) continue
    if (isSolvable(tubes)) return tubes
  }
  return cloneTubes(AUTHORED_LEVELS[AUTHORED_LEVELS.length - 1])
}

export function getLevel(levelId) {
  if (levelId < AUTHORED_LEVELS.length) {
    return cloneTubes(AUTHORED_LEVELS[levelId])
  }
  const colorCount = 4 + ((levelId - AUTHORED_LEVELS.length) % 3)
  return generateLevel(Math.min(colorCount, COLOR_IDS.length))
}
