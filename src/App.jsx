import { useMemo, useState } from 'react'
import ThreatCard from './components/ThreatCard.jsx'
import KevCard from './components/KevCard.jsx'
import rawThreats from './data/threats.json'
import kevSnapshot from './data/kev-snapshot.json'
import './App.css'

function parseTags(tags) {
  if (!tags) return []
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

const threats = rawThreats
  .map((t) => ({ ...t, tags: parseTags(t.tags) }))
  .sort((a, b) => new Date(b.date_added ?? 0) - new Date(a.date_added ?? 0))

const tagCounts = (() => {
  const counts = new Map()
  for (const t of threats) {
    for (const tag of t.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})()

const kevEntries = [...(kevSnapshot.vulnerabilities ?? [])].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))

export default function App() {
  const [view, setView] = useState('notable')
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const filteredThreats = useMemo(() => {
    const q = query.trim().toLowerCase()
    return threats.filter((t) => {
      if (activeTag && !t.tags.includes(activeTag)) return false
      if (!q) return true
      const haystack = [t.title, t.cve_id, t.why_it_matters].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [query, activeTag])

  const filteredKev = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return kevEntries
    return kevEntries.filter((e) => {
      const haystack = [e.cveID, e.vendorProject, e.product, e.vulnerabilityName, e.shortDescription]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query])

  function handleTagClick(tag) {
    setView('notable')
    setActiveTag((current) => (current === tag ? null : tag))
  }

  function selectAll() {
    setView('notable')
    setActiveTag(null)
  }

  return (
    <>
      <header className="ax-header">
        <div className="ax-header-titles">
          <h1 className="ax-title">Threat Watch</h1>
          <p className="ax-subtitle">CVEs and incidents I found notable</p>
        </div>

        <div className="ax-tabs-row">
          <div className="ax-tabs-inner">
            <nav className="ax-tabs">
              <button
                type="button"
                className={`ax-tab${view === 'notable' && activeTag === null ? ' is-active' : ''}`}
                onClick={selectAll}
              >
                All {threats.length}
              </button>
              {tagCounts.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  className={`ax-tab${view === 'notable' && activeTag === tag ? ' is-active' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag} {count}
                </button>
              ))}
              <button
                type="button"
                className={`ax-tab tab-feed${view === 'feed' ? ' is-active' : ''}`}
                onClick={() => setView('feed')}
              >
                Live Feed {kevEntries.length}
              </button>
            </nav>

            <input
              className="ax-input tabs-search"
              type="search"
              placeholder={view === 'feed' ? 'Search vendor, product, CVE ID...' : 'Search titles, CVE IDs, or notes...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="page">
        {view === 'feed' ? (
          <>
            <p className="ax-meta feed-note">
              Recent entries from CISA's Known Exploited Vulnerabilities catalog, refreshed automatically. Not
              curated — browse for candidates worth adding to your own notable list in Obsidian.
            </p>
            {kevEntries.length === 0 ? (
              <div className="ax-card"><div className="ax-empty">No live feed data yet.</div></div>
            ) : filteredKev.length === 0 ? (
              <div className="ax-card"><div className="ax-empty">Nothing in the feed matches your search.</div></div>
            ) : (
              <div className="threat-list">
                {filteredKev.map((entry) => (
                  <KevCard key={entry.cveID} entry={entry} />
                ))}
              </div>
            )}
          </>
        ) : threats.length === 0 ? (
          <div className="ax-card"><div className="ax-empty">No threats logged yet. Add an entry in Obsidian to get started.</div></div>
        ) : filteredThreats.length === 0 ? (
          <div className="ax-card"><div className="ax-empty">Nothing matches your search or filter.</div></div>
        ) : (
          <div className="threat-list">
            {filteredThreats.map((threat) => (
              <ThreatCard
                key={threat.cve_id ?? threat.title}
                threat={threat}
                activeTag={activeTag}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
