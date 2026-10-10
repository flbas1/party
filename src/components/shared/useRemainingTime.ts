
import { useEffect, useState } from 'react'

export type RemainingTime = {
  nowMs: number
  remainingMs: number
  expired: boolean
}

/**
 * Tracks time against an absolute end timestamp.
 *
 * Because remaining time is calculated from Date.now(), the timer
 * catches up after browser throttling, sleep, or temporary suspension.
 */
export function useRemainingTime(
  endAtMs: number | null,
): RemainingTime {
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    setNowMs(Date.now())

    if (endAtMs === null) {
      return
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [endAtMs])

  const remainingMs =
    endAtMs === null ? 0 : Math.max(0, endAtMs - nowMs)

  return {
    nowMs,
    remainingMs,
    expired: endAtMs !== null && remainingMs === 0,
  }
}
