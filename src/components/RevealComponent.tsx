
import { useState } from 'react'
import type { ComponentProps } from '../types/ComponentTypes'
import { useRemainingTime } from './shared/useRemainingTime'

export default function RevealComponent({ node }: ComponentProps) {
  const [localStartedAtMs] = useState(() => Date.now())
const startedAtMs =
  typeof node.startAtMs === 'number'
    ? node.startAtMs
    : localStartedAtMs

  const durationSeconds =
    typeof node.durationSeconds === 'number'
      ? Math.max(0, node.durationSeconds)
      : 120

const endAtMs =
  typeof node.endAtMs === 'number'
    ? node.endAtMs
    : startedAtMs + durationSeconds * 1000

  const { nowMs, expired } = useRemainingTime(endAtMs)

  const durationMs = Math.max(0, endAtMs - startedAtMs)
  const elapsedMs = Math.max(0, nowMs - startedAtMs)

  const progress =
    durationMs === 0
      ? 1
      : Math.min(1, elapsedMs / durationMs)

  const image = node.image ?? node.background
  const direction = node.direction ?? 'center-out'
  const shape = node.cover?.shape ?? 'rectangle'
  const coverColor = node.cover?.color ?? '#173b68'

  let clipPath = 'inset(0 0 0 0)'

  if (!expired && progress < 1) {
    if (direction === 'top-down') {
      const hiddenPercent = (1 - progress) * 100
      clipPath = `inset(0 0 ${hiddenPercent}% 0)`
    } else if (shape === 'circle') {
      const radius = progress * 75
      clipPath = `circle(${radius}% at 50% 50%)`
    } else {
      const inset = (1 - progress) * 50
      clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: node.aspectRatio ?? '16 / 9',
        overflow: 'hidden',
        backgroundColor: coverColor,
      }}
    >
      {image ? (
        <img
          src={image}
          alt={node.alt ?? 'Mystery image'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            clipPath,
          }}
        />
      ) : (
        <div style={{ padding: '1rem', color: 'white' }}>
          Configure an image path
        </div>
      )}

      {node.showProgress === true && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            height: '4px',
            backgroundColor: node.progressColor ?? '#00ff66',
          }}
        />
      )}

      {expired && node.showCompleteLabel === true && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '0.5rem',
            textAlign: 'center',
            color: 'white',
            textShadow: '0 1px 4px black',
          }}
        >
          Image revealed!
        </div>
      )}
    </div>
  )
}
