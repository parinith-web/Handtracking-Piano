import * as Tone from 'tone'

// Note names mapping to piano key indices
export const NOTE_NAMES = [
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6', 'C#6', 'D6', 'D#6', 'E6',
]

// Create a polyphonic synth for simultaneous notes
const synth = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 10,
  voice: Tone.Synth,
  options: {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8,
    },
  },
}).toDestination()

// Reduce volume slightly to avoid clipping
synth.volume.value = -8

let audioStarted = false

/**
 * Must be called from a user gesture (click/tap) before any sound can play.
 * This satisfies browser autoplay policies.
 */
export async function ensureAudioStarted(): Promise<void> {
  if (audioStarted) return
  await Tone.start()
  audioStarted = true
  console.log('Audio context started')
}

// Track which notes are currently being played to avoid re-triggering
const activeNotes = new Set<string>()

/**
 * Play a note by key index. Will not re-trigger if already playing.
 */
export function playNote(keyIndex: number): void {
  if (!audioStarted) return
  const note = NOTE_NAMES[keyIndex]
  if (!note || activeNotes.has(note)) return
  activeNotes.add(note)
  synth.triggerAttack(note, Tone.now())
}

/**
 * Release a note by key index.
 */
export function releaseNote(keyIndex: number): void {
  if (!audioStarted) return
  const note = NOTE_NAMES[keyIndex]
  if (!note || !activeNotes.has(note)) return
  activeNotes.delete(note)
  synth.triggerRelease(note, Tone.now())
}
