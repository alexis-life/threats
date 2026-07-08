function formatDate(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ThreatCard({ threat, activeTag, onTagClick }) {
  const { title, cve_id, date_added, why_it_matters, link, tags } = threat
  const displayDate = formatDate(date_added)

  return (
    <article className="ax-card threat-card">
      <div className="threat-card-top">
        <div className="threat-card-heading">
          <h3>{title}</h3>
          {cve_id && <span className="ax-badge cve-badge">{cve_id}</span>}
        </div>
        {displayDate && <span className="ax-meta">{displayDate}</span>}
      </div>

      {why_it_matters && <p>{why_it_matters}</p>}

      <div className="threat-card-bottom">
        {tags && tags.length > 0 && (
          <div className="tag-chips">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`ax-chip tag-chip${tag === activeTag ? ' is-active' : ''}`}
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {link && (
          <a className="ax-btn source-link" href={link} target="_blank" rel="noreferrer">
            Source
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
            </svg>
          </a>
        )}
      </div>
    </article>
  )
}
