function formatDate(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function KevCard({ entry }) {
  const { cveID, vendorProject, product, vulnerabilityName, dateAdded, shortDescription, dueDate, knownRansomwareCampaignUse, notes } = entry
  const displayDate = formatDate(dateAdded)
  const nvdLink = `https://nvd.nist.gov/vuln/detail/${cveID}`
  const advisoryLink = notes?.split(';').map((s) => s.trim()).find((s) => /^https?:\/\//.test(s) && !s.includes('cisa.gov'))

  return (
    <article className="ax-card threat-card">
      <div className="threat-card-top">
        <div className="threat-card-heading">
          <h3>
            {vendorProject} {product}
          </h3>
          {cveID && <span className="ax-badge cve-badge">{cveID}</span>}
        </div>
        {displayDate && <span className="ax-meta">Added {displayDate}</span>}
      </div>

      {vulnerabilityName && <p className="kev-name">{vulnerabilityName}</p>}
      {shortDescription && <p>{shortDescription}</p>}

      <div className="threat-card-bottom">
        <div className="tag-chips">
          {dueDate && <span className="ax-badge">Due {formatDate(dueDate)}</span>}
          {knownRansomwareCampaignUse && knownRansomwareCampaignUse !== 'Unknown' && (
            <span className="ax-badge kev-chip-danger">Ransomware use: {knownRansomwareCampaignUse}</span>
          )}
        </div>

        <a className="ax-btn source-link" href={advisoryLink || nvdLink} target="_blank" rel="noreferrer">
          Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </svg>
        </a>
      </div>
    </article>
  )
}
