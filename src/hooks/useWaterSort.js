import { useCallback, useEffect, useReducer } from 'react'
import { POUR_BASE_MS, POUR_PER_UNIT_MS } from '../game/constants.js'
import { applyPour, cloneTubes, isWon, pourSize, topColor } from '../game/logic.js'
import { getLevel } from '../game/levels.js'

function loadLevel(levelId) {
  const initial = getLevel(levelId)
  return {
    tubes: cloneTubes(initial),
    initial,
    selected: null,
    moves: 0,
    history: [],
    status: 'idle',
    pour: null,
    reject: null,
    levelId,
  }
}

function commit(state, from, to) {
  const result = applyPour(state.tubes, from, to)
  if (!result) return state
  return {
    ...state,
    tubes: result.tubes,
    history: [...state.history, state.tubes],
    moves: state.moves + 1,
    selected: null,
    pour: null,
    status: isWon(result.tubes) ? 'won' : 'idle',
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'tap': {
      if (state.status !== 'idle') return state
      const { index, instant } = action
      if (state.selected === null) {
        if (state.tubes[index].length === 0) return state
        return { ...state, selected: index, reject: null }
      }
      if (state.selected === index) return { ...state, selected: null }

      const from = state.selected
      const count = pourSize(state.tubes, from, index)
      if (count === 0) {
        return {
          ...state,
          reject: { index, nonce: (state.reject?.nonce ?? 0) + 1 },
        }
      }
      if (instant) return commit(state, from, index)
      return {
        ...state,
        status: 'pouring',
        reject: null,
        pour: {
          from,
          to: index,
          color: topColor(state.tubes[from]),
          count,
          duration: POUR_BASE_MS + POUR_PER_UNIT_MS * (count - 1),
        },
      }
    }
    case 'pourEnd': {
      if (state.status !== 'pouring' || !state.pour) return state
      return commit(state, state.pour.from, state.pour.to)
    }
    case 'clearReject':
      return state.reject ? { ...state, reject: null } : state
    case 'undo': {
      if (state.status === 'pouring' || state.history.length === 0) return state
      return {
        ...state,
        tubes: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
        moves: state.moves - 1,
        selected: null,
        reject: null,
        status: 'idle',
      }
    }
    case 'restart':
      return {
        ...state,
        tubes: cloneTubes(state.initial),
        history: [],
        moves: 0,
        selected: null,
        reject: null,
        pour: null,
        status: 'idle',
      }
    case 'next':
      return loadLevel(state.levelId + 1)
    default:
      return state
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function useWaterSort() {
  const [state, dispatch] = useReducer(reducer, 0, loadLevel)

  const tap = useCallback(
    (index) => dispatch({ type: 'tap', index, instant: prefersReducedMotion() }),
    [],
  )
  const finishPour = useCallback(() => dispatch({ type: 'pourEnd' }), [])
  const clearReject = useCallback(() => dispatch({ type: 'clearReject' }), [])
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const restart = useCallback(() => dispatch({ type: 'restart' }), [])
  const next = useCallback(() => dispatch({ type: 'next' }), [])

  const { pour } = state
  useEffect(() => {
    if (!pour) return
    const id = setTimeout(finishPour, pour.duration + 150)
    return () => clearTimeout(id)
  }, [pour, finishPour])

  return {
    ...state,
    canUndo: state.status !== 'pouring' && state.history.length > 0,
    tap,
    finishPour,
    clearReject,
    undo,
    restart,
    next,
  }
}
