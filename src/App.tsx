import { useEffect, useState } from 'react'
import { parse } from 'yaml'
import './App.css'

import type { Config, ComponentContext } from './types/ComponentTypes'
import { renderComponent } from './registry/componentRegistry'

type Party = {
  id: string
  isDefault: boolean
  configUrl: string
}


async function loadYaml(url: string): Promise<Config> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Could not load ${url}: HTTP ${response.status}`)
  }

  return parse(await response.text()) as Config
}

function App() {
  const [config, setConfig] = useState<Config | null>(null)
  const [partyId, setPartyId] = useState<string | null>(null)
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function initialize() {
      setLoading(true)
      setMessage('')

      try {
        const bootstrap = await loadYaml('/bootstrap.yml')
        setConfig(bootstrap)

        const response = await fetch('/api/parties')
        if (!response.ok) {
          throw new Error(`Party discovery failed: HTTP ${response.status}`)
        }

        const discovered = (await response.json()) as Party[]
        setParties(discovered)

        if (discovered.length === 0) {
          setMessage('No party configurations found under partytime/.')
          return
        }

        const defaults = discovered.filter(party => party.isDefault)
        const selected =
          discovered.length === 1
            ? discovered[0]
            : defaults.length === 1
              ? defaults[0]
              : undefined

        if (selected) {
          await selectParty(selected)
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : String(error))
      } finally {
        setLoading(false)
      }
    }

    void initialize()
  }, [])

  async function selectOption(_option: Config) {
    setMessage('This option is not implemented yet.')
  }

  async function selectParty(party: Party) {
    setLoading(true)
    setMessage('')

    try {
      const partyConfig = await loadYaml(party.configUrl)
      setConfig(partyConfig)
      setPartyId(party.id)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  async function returnToBootstrap() {
    setLoading(true)
    setMessage('')
    setPartyId(null)
    setParties([])

    try {
      setConfig(await loadYaml('/bootstrap.yml'))

      const response = await fetch('/api/parties')
      if (!response.ok) {
        throw new Error(`Party discovery failed: HTTP ${response.status}`)
      }

      const discovered = (await response.json()) as Party[]
      setParties(discovered)

      if (discovered.length === 0) {
        setMessage('No party configurations found under partytime/.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  const context: ComponentContext = {
  loading,
  onOption: selectOption,
  renderComponent,
}

  const isBootstrap = config?.id === 'bootstrap'
  const title = config?.title ?? config?.app?.name ?? 'PipBoy'
  const nodes: Config[] = config?.components ?? config?.layout?.children ?? []

  if (!config && loading) {
    return <main><p>Loading PipBoy...</p></main>
  }

  if (!config) {
    return (
      <main>
        <h1>PipBoy</h1>
        <p role="alert">{message || 'Configuration could not be loaded.'}</p>
        <button onClick={returnToBootstrap}>Retry</button>
      </main>
    )
  }

  return (
    <main>
      <header>
        <h1>{title}</h1>
        {partyId && (
          <button className="back" onClick={returnToBootstrap}>
            Back to party selection
          </button>
        )}
      </header>

      {isBootstrap && parties.length > 0 && (
        <section className="card">
          <h2>Available Parties</h2>
          {parties.map(party => (
            <button
              key={party.id}
              disabled={loading}
              onClick={() => selectParty(party)}
            >
              {party.id}
            </button>
          ))}
        </section>
      )}

      {nodes.map((node, index) =>
        renderComponent(node, context, index),
      )}

      {loading && <p>Loading...</p>}
      {message && <p role="status">{message}</p>}
    </main>
  )
}

export default App
