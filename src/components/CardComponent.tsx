
import type { ComponentProps } from '../types/ComponentTypes'

export default function CardComponent({ node, context }: ComponentProps) {
  return (
    <section className="card">
      {node.title && <h2>{node.title}</h2>}
      {node.text && <p>{node.text}</p>}

      {node.options?.map((option: Record<string, any>, index: number) => (
        <button
          key={option.label ?? index}
          disabled={context.loading}
          onClick={() => context.onOption(option)}
          title={option.description}
        >
          {option.label ?? 'Option'}
          {option.description && <small>{option.description}</small>}
        </button>
      ))}
    </section>
  )
}
