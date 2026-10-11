
import type { ReactNode } from 'react'
import type {
  Config,
  ComponentContext,
  ComponentRenderer,
} from '../types/ComponentTypes'

import TextComponent from '../components/TextComponent'
import HeadingComponent from '../components/HeadingComponent'
import CardComponent from '../components/CardComponent'
import LayoutComponent from '../components/LayoutComponent'
import CountdownComponent from '../components/CountdownComponent'
import RevealComponent from '../components/RevealComponent'
import RevealGameComponent from '../components/RevealGameComponent'
import SlideshowComponent from '../components/SlideshowComponent'
import TabCardComponent from '../components/TabCardComponent'

function UnsupportedComponent({ node }: {
  node: Config
}) {
  return (
    <section className="card unsupported">
      <h2>Unsupported component</h2>
      <p>
        This configuration requests an unknown component:
        {' '}
        <code>{String(node.type ?? '(missing type)')}</code>
      </p>
    </section>
  )
}

export const componentRegistry: Record<string, ComponentRenderer> = {
  text: TextComponent,
  heading: HeadingComponent,
  card: CardComponent,
  vertical: LayoutComponent,
  horizontal: LayoutComponent,
  countdown: CountdownComponent,
  reveal: RevealComponent,
  revealGame: RevealGameComponent,
  slideshow: SlideshowComponent,
  tabcard: TabCardComponent,
}

export function renderComponent(
  node: Config,
  context: ComponentContext,
  key: string | number,
): ReactNode {
  if (!node || typeof node !== 'object') {
    return null
  }

  const type = typeof node.type === 'string' ? node.type : ''
  const Component = componentRegistry[type]

  if (!Component) {
    return <UnsupportedComponent key={key} node={node} />
  }

  return <Component key={key} node={node} context={context} />
}
