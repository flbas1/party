
import type { ComponentType, ReactNode } from 'react'

export type Config = Record<string, any>

export type ComponentContext = {
  loading: boolean
  partyId: string | null
  onOption: (option: Config) => void
  renderComponent: (
    node: Config,
    context: ComponentContext,
    key: string | number,
  ) => ReactNode
}

export type ComponentProps = {
  node: Config
  context: ComponentContext
}

export type ComponentRenderer = ComponentType<ComponentProps>
