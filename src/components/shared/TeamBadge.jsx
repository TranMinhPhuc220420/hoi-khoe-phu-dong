const GROUP_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

/**
 * @param {import('../../types/index.js').Team} team
 * @returns {string | null}
 */
function resolveLogoUrl(team) {
  if (team.logoUrl) return team.logoUrl
  if (team.countryCode) return `https://flagcdn.com/w40/${team.countryCode}.png`
  return null
}

/**
 * @param {{
 *   team?: import('../../types/index.js').Team | null
 *   name?: string
 *   logoUrl?: string | null
 *   countryCode?: string | null
 *   showName?: boolean
 *   className?: string
 * }} props
 */
export function TeamBadge({ team, name, logoUrl, countryCode, showName = true, className = '' }) {
  const displayName = name ?? team?.name ?? ''
  const resolvedLogo =
    logoUrl ??
    (team ? resolveLogoUrl(team) : countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : null)

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {resolvedLogo ? (
        <img
          src={resolvedLogo}
          alt=""
          className="h-5 w-5 shrink-0 rounded-sm object-cover"
          loading="lazy"
        />
      ) : null}
      {showName ? <span>{displayName}</span> : null}
    </span>
  )
}

/**
 * @param {import('../../types/index.js').Team[]} teams
 * @returns {import('../../types/index.js').Team[]}
 */
export function sortTeamsForSelect(teams) {
  return [...teams].sort((a, b) => {
    const ga = a.group ?? 'ZZ'
    const gb = b.group ?? 'ZZ'
    if (ga !== gb) return ga.localeCompare(gb)
    return a.name.localeCompare(b.name)
  })
}

export { GROUP_OPTIONS }
