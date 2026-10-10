
import type { ComponentProps } from '../types/ComponentTypes'

export default function HeadingComponent({ node }: ComponentProps) {
  const level = Math.min(6, Math.max(1, Number(node.level) || 1))
  const content = node.content ?? node.text ?? ''

  switch (level) {
    case 1: return <h1>{content}</h1>
    case 2: return <h2>{content}</h2>
    case 3: return <h3>{content}</h3>
    case 4: return <h4>{content}</h4>
    case 5: return <h5>{content}</h5>
    default: return <h6>{content}</h6>
  }
}
