import { Link } from 'react-router-dom'
import { formatMatchDateTime, formatScore } from '../../utils/format.js'
import { StageBadge } from './StageBadge.jsx'
import { TeamBadge } from '../shared/TeamBadge.jsx'

/**
 * @param {{
 *   match: import('../../types/index.js').Match
 *   teamsById?: Record<string, import('../../types/index.js').Team>
 *   compact?: boolean
 * }} props
 */
export function MatchRow({ match, teamsById = {}, compact = false }) {
  const homeTeam = match.homeTeamId ? teamsById[match.homeTeamId] : null
  const awayTeam = match.awayTeamId ? teamsById[match.awayTeamId] : null

  return (
    <div
      className={`flex flex-col gap-2 border-b border-secondary/10 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between ${
        compact ? 'py-2' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-primary">
          {homeTeam ? (
            <TeamBadge team={homeTeam} />
          ) : (
            <span>{match.homeTeam}</span>
          )}
          <span className="text-secondary">vs</span>
          {awayTeam ? (
            <TeamBadge team={awayTeam} />
          ) : (
            <span>{match.awayTeam}</span>
          )}
        </p>
        <p className="text-sm text-secondary">{formatMatchDateTime(match.matchTime)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StageBadge stage={match.stage} />
        <span className="text-sm font-medium text-primary">
          {formatScore(match.homeScore, match.awayScore)}
        </span>
      </div>
    </div>
  )
}

/**
 * @param {{
 *   matches: import('../../types/index.js').Match[]
 *   teamsById?: Record<string, import('../../types/index.js').Team>
 *   viewAllHref?: string
 * }} props
 */
export function UpcomingMatchesList({ matches, teamsById = {}, viewAllHref = '/matches' }) {
  if (!matches.length) {
    return <p className="text-sm text-secondary">Không có trận sắp diễn ra.</p>
  }

  return (
    <div>
      {matches.map((match) => (
        <MatchRow key={match.id} match={match} teamsById={teamsById} compact />
      ))}
      <Link to={viewAllHref} className="mt-3 inline-block text-sm font-semibold text-tertiary hover:underline">
        Xem tất cả →
      </Link>
    </div>
  )
}
