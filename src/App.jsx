import { useMemo, useState } from 'react'
import ThreatCard from './components/ThreatCard.jsx'
import rawThreats from './data/threats.json'
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

export default function App() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return threats.filter((t) => {
      if (activeTag && !t.tags.includes(activeTag)) return false
      if (!q) return true
      const haystack = [t.title, t.cve_id, t.why_it_matters].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [query, activeTag])

  function handleTagClick(tag) {
    setActiveTag((current) => (current === tag ? null : tag))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>threats</h1>
        <p>CVEs and incidents I found notable</p>
      </header>

      <div className="controls">
        <input
          className="search-input"
          type="search"
          placeholder="Search title, CVE ID, or notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {activeTag && (
          <span className="active-filter-pill">
            {activeTag}
            <button type="button" onClick={() => setActiveTag(null)} aria-label={`Clear ${activeTag} filter`}>
              ×
            </button>
          </span>
        )}
      </div>

      {threats.length === 0 ? (
        <div className="empty-state">No threats logged yet. Add an entry in Obsidian to get started.</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Nothing matches your search or filter.</div>
      ) : (
        <div className="threat-list">
          {filtered.map((threat) => (
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
  )
}
