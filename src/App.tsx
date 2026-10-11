import { useEffect, useState } from 'react'
import { parse } from 'yaml'
// import './App.css'

import type { Config, ComponentContext } from './types/ComponentTypes'
import { renderComponent } from './registry/componentRegistry'
// import { resolveAssetUrl } from './utils/resolveAssetUrl'

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
        console.log('Bootstrap loaded:', bootstrap)
        setConfig(bootstrap)

        const response = await fetch('/api/parties')
        if (!response.ok) {
          throw new Error(`Party discovery failed: HTTP ${response.status}`)
        }

        const discovered = (await response.json()) as Party[]
        console.log('Parties discovered:', discovered)
        setParties(discovered)

        if (discovered.length === 0) {
          setMessage('No party configurations found under partytime/.')
        }

        const defaults = discovered.filter(party => party.isDefault)
        const selected = discovered.length === 1
          ? discovered[0]
          : defaults.length === 1
            ? defaults[0]
            : undefined

        if (selected) {
          await selectParty(selected)
        }
      } catch (error) {
        console.error('Initialization failed:', error)
        setMessage(error instanceof Error ? error.message : String(error))
      } finally {
        setLoading(false)
      }
    }
    void initialize()
  }, [])


  useEffect(() => {
    console.log('Stylesheet effect:', partyId, config?.style)

    if (!partyId || typeof config?.style !== 'string') {
      console.log('Stylesheet skipped')
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `/api/parties/${partyId}/${config.style.replace(/^\.?\//, '')}`

    console.log('Appending stylesheet:', link.href)
    document.head.appendChild(link)

    return () => link.remove()
  }, [partyId, config?.style])




  async function selectOption(_option: Config) {
    setMessage('This option is not implemented yet.')
  }

  async function selectParty(party: Party) {
    console.log('selectParty called:', party)

    setLoading(true)
    setMessage('')

    try {
      const partyConfig = await loadYaml(party.configUrl)
      console.log('Loaded party config:', partyConfig)

      setConfig(partyConfig)
      setPartyId(party.id)
    } catch (error) {
      console.error('selectParty failed:', error)
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
  partyId,
  onOption: selectOption,
  renderComponent,
}

  const isBootstrap = config?.id === 'bootstrap'

  console.log('RENDER', {
    configId: config?.id,
    isBootstrap,
    partyCount: parties.length,
    loading,
  })

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

  console.log('Bootstrap render check', {
    configId: config?.id,
    isBootstrap,
    partyCount: parties.length,
    loading,
  })

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
