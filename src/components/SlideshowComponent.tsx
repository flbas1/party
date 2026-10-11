
import { useEffect, useState } from 'react'
import type { ComponentProps, Config } from '../types/ComponentTypes'
import { useRemainingTime } from './shared/useRemainingTime'
import { resolveAssetUrl } from '../utils/resolveAssetUrl'

type RevealType = 'center-out' | 'top-down' | 'full'

export default function SlideshowComponent({ node, context }: ComponentProps) {
  const rounds: Config[] = Array.isArray(node.rounds) ? node.rounds : []
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startedAtMs, setStartedAtMs] = useState(() => Date.now())

  const round = rounds[index]
  const durationSeconds =
    typeof round?.durationSeconds === 'number'
      ? Math.max(0, round.durationSeconds)
      : null

  const pauseSeconds =
    typeof round?.pauseSeconds === 'number'
      ? Math.max(0, round.pauseSeconds)
      : 0

  const transition = round?.reveal ?? node.transition
  const revealType: RevealType =
    transition === 'reveal'
      ? 'center-out'
      : transition === 'center-out' ||
          transition === 'top-down' ||
          transition === 'full'
        ? transition
        : 'full'

  const usesReveal = Boolean(round?.reveal) || node.transition === 'reveal'
  const endAtMs =
    durationSeconds === null ? null : startedAtMs + durationSeconds * 1000

  const { nowMs, remainingMs, expired } = useRemainingTime(
    endAtMs !== null && !revealed ? endAtMs : null,
  )

  const revealProgress =
    durationSeconds === null || durationSeconds === 0 || revealed || expired
      ? 1
      : Math.min(1, Math.max(0, (nowMs - startedAtMs) / (durationSeconds * 1000)))

  useEffect(() => {
    if (!round || finished || !revealed || pauseSeconds <= 0) return

    const timeout = window.setTimeout(() => {
      if (index >= rounds.length - 1) {
        setFinished(true)
      } else {
        setIndex(current => current + 1)
        setRevealed(false)
        setStartedAtMs(Date.now())
      }
    }, pauseSeconds * 1000)

    return () => window.clearTimeout(timeout)
  }, [index, pauseSeconds, revealed, finished, round, rounds.length])

  useEffect(() => {
    if (!round || finished || revealed || durationSeconds === null) return

    if (expired) {
      setRevealed(true)
    }
  }, [round, finished, revealed, durationSeconds, expired])

  if (rounds.length === 0) {
    return <div className="slideshow">No slides configured.</div>
  }

  if (finished) {
    return (
      <div className="slideshow">
        <p>Slideshow complete.</p>
        <button
          type="button"
          onClick={() => {
            setIndex(0)
            setRevealed(false)
            setFinished(false)
            setStartedAtMs(Date.now())
          }}
        >
          Restart
        </button>
      </div>
    )
  }

  const handleNext = () => {
    if (!revealed && usesReveal) {
      setRevealed(true)
      return
    }

    if (index >= rounds.length - 1) {
      setFinished(true)
      return
    }

    setIndex(current => current + 1)
    setRevealed(false)
    setStartedAtMs(Date.now())
  }

  let clipPath = 'inset(0 0 0 0)'

  if (usesReveal && !revealed && revealProgress < 1) {
    if (revealType === 'full') {
      clipPath = 'inset(0 0 100% 0)'
    } else if (revealType === 'top-down') {
      clipPath = `inset(0 0 ${(1 - revealProgress) * 100}% 0)`
    } else {
      const inset = (1 - revealProgress) * 50
      clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`
    }
  }

  const image =
  typeof round.image === 'string'
    ? resolveAssetUrl(round.image, context.partyId)
    : undefined

  const showProgress = usesReveal && durationSeconds !== null && !revealed

  return (
    <div className="slideshow">
      {round.text && <h2>{round.text}</h2>}

      <div
        className="slideshow-image"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: round.aspectRatio ?? '16 / 9',
          overflow: 'hidden',
          background: round.cover?.color ?? '#173b68',
        }}
      >
        {image ? (
          <img
            src={image}
            alt={round.alt ?? round.text ?? 'Slideshow image'}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0,
              objectFit: 'cover',
              clipPath: usesReveal ? clipPath : 'none',
            }}
          />
        ) : (
          <p>Configure an image path.</p>
        )}

        {showProgress && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: 4,
              width: `${revealProgress * 100}%`,
              background: round.progressColor ?? '#00ff66',
            }}
          />
        )}
      </div>

      {durationSeconds !== null && !revealed && usesReveal && (
        <p className="slideshow-timer">
          {Math.ceil(remainingMs / 1000)} seconds
        </p>
      )}

      {node.next === true && (
        <button type="button" onClick={handleNext}>
          {!revealed && usesReveal
            ? 'Reveal'
            : index === rounds.length - 1
              ? 'Finish'
              : 'Next'}
        </button>
      )}
    </div>
  )
}
