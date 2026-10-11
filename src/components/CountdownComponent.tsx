
import { useState } from 'react'
import type { ComponentProps } from '../types/ComponentTypes'
import { useRemainingTime } from './shared/useRemainingTime'

type ViewMode = 'digital' | 'compact' | 'long' | 'date-diff'

function parseTarget(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const input = value.trim()
  let date: Date

  // A date without a time means local midnight, not UTC midnight.
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    // Datetimes with Z or an explicit offset retain that timezone.
    // Datetimes without a timezone are interpreted as local time.
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input)
    const normalized =
      !hasTimezone && /^\d{4}-\d{2}-\d{2}T/.test(input)
        ? input
        : input

    date = new Date(normalized)
  }

  return Number.isNaN(date.getTime()) ? null : date.getTime()
}


function formatRemaining(totalMs: number, mode: ViewMode): string {
  const totalSeconds = Math.ceil(totalMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (value: number) => String(value).padStart(2, '0')

  switch (mode) {
    case 'digital': {
      const fields = [days, hours, minutes, seconds]
      const firstVisible = fields.findIndex(
        (value, index) => index === 3 || value !== 0,
      )
      return fields
        .slice(firstVisible)
        .map(pad)
        .join(' : ')
    }

    case 'compact': {
      const parts: string[] = []
      if (days) parts.push(`${days}d`)
      if (hours) parts.push(`${hours}h`)
      if (minutes) parts.push(`${minutes}m`)
      if (seconds || parts.length === 0) parts.push(`${seconds}s`)
      return parts.join(' ')
    }

    case 'long': {
      const parts: string[] = []
      if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`)
      if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
      if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
      if (seconds || parts.length === 0) {
        parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`)
      }
      return parts.join(', ')
    }

    case 'date-diff': {
      const time = `${pad(hours)}:${pad(minutes)}`
      return days ? `${days} ${time}` : time
    }
  }
}


export default function CountdownComponent({
  node,
}: ComponentProps) {
  const [localStartedAtMs] = useState(() => Date.now())
const startedAtMs =
  typeof node.startAtMs === 'number'
    ? node.startAtMs
    : localStartedAtMs

  const [selectedMode, setSelectedMode] = useState<ViewMode>(
    node.viewMode ?? 'digital',
  )

  const targetMs =
    typeof node.endAtMs === 'number'
      ? node.endAtMs
      : parseTarget(node.target ?? node.endAt)

  const durationSeconds =
    typeof node.durationSeconds === 'number'
      ? Math.max(0, node.durationSeconds)
      : null

const endAtMs =
  typeof node.endAtMs === 'number'
    ? node.endAtMs
    : targetMs ??
      (durationSeconds !== null
        ? startedAtMs + durationSeconds * 1000
        : null)

  const { remainingMs, expired } = useRemainingTime(endAtMs)

  const configuredModes: ViewMode[] = Array.isArray(node.viewModes)
    ? node.viewModes.filter((mode: string): mode is ViewMode =>
        ['digital', 'compact', 'long', 'date-diff'].includes(mode),
      )
    : ['digital', 'compact', 'long', 'date-diff']

  const modes = configuredModes.length ? configuredModes : ['digital' as ViewMode]
  const mode = modes.includes(selectedMode) ? selectedMode : modes[0]
  const allowViewChange = node.allowViewChange === true && modes.length > 1

  const text = endAtMs === null
    ? 'Configure a target or duration'
    : expired
      ? 'Time is up!'
      : formatRemaining(remainingMs, mode)

  return (
    <div
      style={{
        textAlign: node.textAlign ?? 'center',
        color: node.color ?? 'inherit',
        fontSize: node.fontSize ?? '2rem',
        fontFamily: node.fontFamily ?? 'monospace',
        padding: node.padding ?? '1rem',
        background: node.backgroundColor ?? 'transparent',
      }}
    >
      <div aria-live="off">{text}</div>

      {mode === 'digital' && endAtMs !== null && !expired && (
        <div style={{ fontSize: '0.75em', opacity: 0.7 }}>
          Days : Hours : Minutes : Seconds
        </div>
      )}

      {allowViewChange && (
        <button
          type="button"
          onClick={() => {
            const index = modes.indexOf(mode)
            setSelectedMode(modes[(index + 1) % modes.length])
          }}
          style={{ marginTop: '0.5rem' }}
        >
          Change display
        </button>
      )}
    </div>
  )
}
