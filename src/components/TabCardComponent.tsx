
import { useEffect, useState } from 'react'
import type {  ComponentProps } from '../types/ComponentTypes'


type TabItem = {
    name?: string
    description?: string
    content?: string
}

type Tab = {
    name: string
    items?: TabItem[] | string[]
}

export default function TabCardComponent({ node }: ComponentProps) {
    const tabs: Tab[] = Array.isArray(node.tabs) ? node.tabs : []
    const layout = node.layout === 'vertical' ? 'vertical' : 'horizontal'
    const selection = node.selection === 'multiple' ? 'multiple' : 'single'

    // defaultOpen can be a tab name, true (first tab), or omitted.
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

    // Reset open tabs when the configuration changes.
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
            <div className="tabcard-tabs" role="tablist"
                aria-orientation={layout === 'vertical' ? 'vertical' : 'horizontal'}>
                {tabs.map((tab, index) => {
                    const isOpen = openTabs.includes(tab.name)
                    const panelId = `tabcard-panel-${index}`

                    return (
                        <button
                            key={`${tab.name}-${index}`}
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
                    const isOpen = openTabs.includes(tab.name)
                    if (!isOpen) return null

                    return (
                        <div
                            key={`${tab.name}-${index}`}
                            id={`tabcard-panel-${index}`}
                            className="tabcard-panel"
                        >
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
                                            <div className="tabcard-item-name">{entry.name}</div>
                                        )}

                                        {(entry.description || entry.content) && (
                                            <div className="tabcard-item-description">
                                                {entry.description ?? entry.content}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
