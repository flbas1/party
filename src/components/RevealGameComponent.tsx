
import { useState } from 'react'
import type { ComponentProps, Config } from '../types/ComponentTypes'

export default function RevealGameComponent({
  node,
  context,
}: ComponentProps) {
  const [startAtMs] = useState(() => Date.now())

  const durationSeconds =
    typeof node.durationSeconds === 'number'
      ? Math.max(0, node.durationSeconds)
      : 30

  const endAtMs = startAtMs + durationSeconds * 1000

  const children: Config[] = Array.isArray(node.children)
    ? node.children
    : []

  return (
    <div className="reveal-game">
      {children.map((child, index) =>
        context.renderComponent(
          {
            ...child,
            startAtMs,
            endAtMs,
          },
          context,
          `reveal-game-${index}`,
        ),
      )}
    </div>
  )
}
