
import type { ComponentProps } from '../types/ComponentTypes'

export default function LayoutComponent({ node, context }: ComponentProps) {
  const direction = node.type === 'horizontal' ? 'horizontal' : 'vertical'

  return (
    <div className={`layout ${direction}`}>
      {node.children?.map((child: Record<string, any>, index: number) =>
        context.renderComponent(child, context, `${direction}-${index}`),
      )}
    </div>
  )
}
