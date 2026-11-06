let context = null
let master = null

function audioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (context) return context
  context = new AudioCtx()
  master = context.createGain()
  master.gain.value = 0.42
  master.connect(context.destination)
  return context
}

function pinkNoise(ctx, seconds) {
  const length = Math.ceil(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0
  let b1 = 0
  let b2 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + white * 0.099046
    b1 = 0.963 * b1 + white * 0.2965164
    b2 = 0.57 * b2 + white * 1.0526913
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.14
  }
  return buffer
}

function bubble(ctx, destination, time) {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  const startFreq = 420 + Math.random() * 380
  osc.frequency.setValueAtTime(startFreq, time)
  osc.frequency.exponentialRampToValueAtTime(160 + Math.random() * 50, time + 0.07)

  const gain = ctx.createGain()
  const peak = 0.008 + Math.random() * 0.006
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08)

  osc.connect(gain)
  gain.connect(destination)
  osc.start(time)
  osc.stop(time + 0.09)
}

export function playPour(durationMs) {
  const ctx = audioContext()
  if (!ctx) return () => {}
  if (ctx.state === 'suspended') void ctx.resume()

  const now = ctx.currentTime
  const duration = Math.max(0.24, durationMs / 1000)
  const end = now + duration
  const releaseAt = end - Math.min(0.11, duration * 0.32)
  const noise = pinkNoise(ctx, duration + 0.08)

  const flow = ctx.createBufferSource()
  flow.buffer = noise
  flow.loop = false

  const body = ctx.createBiquadFilter()
  body.type = 'lowpass'
  body.frequency.setValueAtTime(1600, now)
  body.frequency.exponentialRampToValueAtTime(780, end)
  body.Q.value = 0.55

  const air = ctx.createBiquadFilter()
  air.type = 'highpass'
  air.frequency.value = 320
  air.Q.value = 0.4

  const flowGain = ctx.createGain()
  flowGain.gain.setValueAtTime(0.0001, now)
  flowGain.gain.exponentialRampToValueAtTime(0.11, now + 0.045)
  flowGain.gain.setValueAtTime(0.085, releaseAt)
  flowGain.gain.exponentialRampToValueAtTime(0.0001, end)

  const wobble = ctx.createGain()
  wobble.gain.value = 1
  const drift = ctx.createOscillator()
  drift.frequency.value = 7
  const driftDepth = ctx.createGain()
  driftDepth.gain.value = 0.12
  drift.connect(driftDepth)
  driftDepth.connect(wobble.gain)

  flow.connect(body)
  body.connect(air)
  air.connect(flowGain)
  flowGain.connect(wobble)
  wobble.connect(master)

  const trickle = ctx.createBufferSource()
  trickle.buffer = noise
  const trickleFilter = ctx.createBiquadFilter()
  trickleFilter.type = 'bandpass'
  trickleFilter.frequency.value = 2200
  trickleFilter.Q.value = 0.7
  const trickleGain = ctx.createGain()
  trickleGain.gain.setValueAtTime(0.0001, now)
  trickleGain.gain.exponentialRampToValueAtTime(0.028, now + 0.04)
  trickleGain.gain.exponentialRampToValueAtTime(0.0001, end)
  trickle.connect(trickleFilter)
  trickleFilter.connect(trickleGain)
  trickleGain.connect(master)

  flow.start(now)
  trickle.start(now)
  drift.start(now)
  flow.stop(end + 0.02)
  trickle.stop(end + 0.02)
  drift.stop(end + 0.02)

  const bubbles = 2 + Math.round(duration * 3)
  const span = Math.max(0.04, duration - 0.1)
  for (let i = 0; i < bubbles; i++) {
    bubble(ctx, master, now + 0.05 + Math.random() * span)
  }

  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    const time = ctx.currentTime
    for (const gain of [flowGain.gain, trickleGain.gain]) {
      gain.cancelScheduledValues(time)
      gain.setValueAtTime(Math.max(gain.value, 0.0001), time)
      gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
    }
    flow.stop(time + 0.05)
    trickle.stop(time + 0.05)
    drift.stop(time + 0.05)
  }
}

const SOLVE_NOTES = [659.25, 830.61, 987.77, 1318.51]

function chime(ctx, destination, time, freq, peak) {
  const tone = ctx.createOscillator()
  tone.type = 'sine'
  tone.frequency.value = freq
  const toneGain = ctx.createGain()
  toneGain.gain.setValueAtTime(0.0001, time)
  toneGain.gain.exponentialRampToValueAtTime(peak, time + 0.02)
  toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5)

  const sparkle = ctx.createOscillator()
  sparkle.type = 'sine'
  sparkle.frequency.value = freq * 2
  const sparkleGain = ctx.createGain()
  sparkleGain.gain.setValueAtTime(0.0001, time)
  sparkleGain.gain.exponentialRampToValueAtTime(peak * 0.18, time + 0.012)
  sparkleGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22)

  tone.connect(toneGain)
  sparkle.connect(sparkleGain)
  toneGain.connect(destination)
  sparkleGain.connect(destination)
  tone.start(time)
  sparkle.start(time)
  tone.stop(time + 0.52)
  sparkle.stop(time + 0.24)
}

export function playSolve() {
  const ctx = audioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const now = ctx.currentTime + 0.04
  SOLVE_NOTES.forEach((freq, i) => {
    chime(ctx, master, now + i * 0.08, freq, 0.07)
  })
}
