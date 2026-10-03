// Audio & Haptic engine for Imposter Game
// Uses cached HTMLAudio for round-end cue and Web Audio API synthesizer
// for tension countdown ticks. Respects user's sound & haptics settings.

let cachedAudio: HTMLAudioElement | null = null
let audioCtx: AudioContext | null = null

function getAudio(): HTMLAudioElement {
  if (!cachedAudio) {
    cachedAudio = new Audio('/sounds/round-end.mp3')
    cachedAudio.preload = 'auto'
  }
  return cachedAudio
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      audioCtx = new AudioCtx()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function preloadRoundEndCue() {
  if (typeof window === 'undefined') return
  getAudio()
  getAudioContext()
}

/**
 * Tension tick for the final 10 seconds of a round.
 * Synthesizes a crisp, tension-building woodblock clock pulse.
 */
export function playCountdownTick(secondsRemaining: number, soundEnabled = true, hapticsEnabled = true) {
  if (typeof window === 'undefined') return

  if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(35)
  }

  if (!soundEnabled) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Base pitch increases as timer approaches 0 (tension rise)
    const baseFreq = 520 + (10 - Math.max(1, secondsRemaining)) * 40
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    /* AudioContext blocked or unsupported */
  }
}

export function playRoundEndCue(soundEnabled = true, hapticsEnabled = true) {
  if (typeof window === 'undefined') return

  if (soundEnabled) {
    const audio = getAudio()
    audio.currentTime = 0
    void audio.play().catch(() => {})
  }

  if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([200, 100, 200])
  }
}
