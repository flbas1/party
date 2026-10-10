
import type { ComponentProps } from '../types/ComponentTypes'

export default function TextComponent({ node }: ComponentProps) {
  return <p>{node.content ?? node.text ?? ''}</p>
}
