
import { useEffect, useState } from 'react'
import type { ComponentProps, Config } from '../types/ComponentTypes'

type TabItem = {
    name?: string
    description?: string
    content?: string
}

type Tab = {
    name: string
    id?: string
    description?: string
    children?: Config[]
    items?: TabItem[] | string[]
}

export default function TabCardComponent({ node, context }: ComponentProps) {
    console.log('TabCardComponent called:', node)
    
    const tabs: Tab[] = Array.isArray(node.tabs) ? node.tabs : []
    const layout = node.layout === 'vertical' ? 'vertical' : 'horizontal'
    const selection = node.selection === 'multiple' ? 'multiple' : 'single'

    // Tab names identify open tabs. Fall back to the first tab when requested.
    const getDefaults = (): string[] => {
        if (typeof node.defaultOpen === 'string') {
            return tabs.some(tab => tab.name === node.defaultOpen)
                ? [node.defaultOpen]
                : []
        }

        if (node.defaultOpen === true && tabs.length > 0) {
            return [tabs[0].name]
        }

        return []
    }

    const [openTabs, setOpenTabs] = useState<string[]>(getDefaults)

    useEffect(() => {
        setOpenTabs(getDefaults())
    }, [node])

    function toggleTab(name: string) {
        setOpenTabs(current => {
            const isOpen = current.includes(name)

            if (selection === 'single') {
                return isOpen ? [] : [name]
            }

            return isOpen
                ? current.filter(tabName => tabName !== name)
                : [...current, name]
        })
    }

    return (
        <section className={`tabcard tabcard-${layout} tabcard-${selection}`}>
            <div
                className="tabcard-tabs"
                role="tablist"
                aria-orientation={layout === 'vertical' ? 'vertical' : 'horizontal'}
            >
                {tabs.map((tab, index) => {
                    const isOpen = openTabs.includes(tab.name)
                    const panelId = `tabcard-panel-${index}`

                    return (
                        <button
                            key={`${tab.id ?? tab.name}-${index}`}
                            type="button"
                            className={`tabcard-tab${isOpen ? ' active' : ''}`}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => toggleTab(tab.name)}
                        >
                            {tab.name}
                        </button>
                    )
                })}
            </div>

            <div className="tabcard-panels">
                {tabs.map((tab, index) => {
                    if (!openTabs.includes(tab.name)) return null

                    return (
                        <div
                            key={`${tab.id ?? tab.name}-${index}`}
                            id={`tabcard-panel-${index}`}
                            className="tabcard-panel"
                        >
                            {/* Render nested components when supplied. */}
                            {Array.isArray(tab.children) &&
                                tab.children.map((child, childIndex) =>
                                    context.renderComponent(
                                        child,
                                        context,
                                        `${tab.id ?? tab.name}-${childIndex}`,
                                    ),
                                )}

                            {/* Preserve existing menu item rendering. */}
                            {Array.isArray(tab.items) && tab.items.map((item, itemIndex) => {
                                const entry: TabItem = typeof item === 'string'
                                    ? { name: item }
                                    : item

                                return (
                                    <div
                                        className="tabcard-item"
                                        key={`${entry.name ?? 'item'}-${itemIndex}`}
                                    >
                                        {entry.name && (
                                            <div className="tabcard-item-name">
                                                {entry.name}
                                            </div>
                                        )}

                                        {(entry.description || entry.content) && (
                                            <div className="tabcard-item-description">
                                                {entry.description ?? entry.content}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Support simple description-only placeholder tabs. */}
                            {!tab.children?.length &&
                                !tab.items?.length &&
                                tab.description && (
                                    <div className="tabcard-item-description">
                                        {tab.description}
                                    </div>
                                )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
