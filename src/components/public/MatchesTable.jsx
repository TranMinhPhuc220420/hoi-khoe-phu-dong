import { Fragment, useMemo, useState } from 'react'
import { parseMatchTime, formatMatchDateTime, formatScore } from '../../utils/format.js'
import { StageBadge } from './StageBadge.jsx'
import { PredictionMatrix } from './PredictionMatrix.jsx'
import { TeamBadge } from '../shared/TeamBadge.jsx'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '../ui/Table.jsx'
import { Button } from '../ui/Button.jsx'

/**
 * @param {{
 *   matches: import('../../types/index.js').Match[]
 *   users: import('../../types/index.js').User[]
 *   teamsById?: Record<string, import('../../types/index.js').Team>
 *   stageFilter: 'all' | import('../../types/index.js').MatchStage
 *   showUnfinishedOnly: boolean
 * }} props
 */
export function MatchesTable({ matches, users, teamsById = {}, stageFilter, showUnfinishedOnly }) {
  const [expandedId, setExpandedId] = useState(/** @type {string | null} */ (null))

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  )

  const filtered = useMemo(() => {
    let list = [...matches]
    if (stageFilter !== 'all') {
      list = list.filter((m) => m.stage === stageFilter)
    }
    if (showUnfinishedOnly) {
      list = list.filter((m) => !m.isFinished)
    }
    return list.sort((a, b) => {
      const ta = parseMatchTime(a.matchTime)?.getTime() ?? 0
      const tb = parseMatchTime(b.matchTime)?.getTime() ?? 0
      return ta - tb
    })
  }, [matches, stageFilter, showUnfinishedOnly])

  const renderMatchTeams = (match) => {
    const homeTeam = match.homeTeamId ? teamsById[match.homeTeamId] : null
    const awayTeam = match.awayTeamId ? teamsById[match.awayTeamId] : null

    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        {homeTeam ? <TeamBadge team={homeTeam} /> : <span>{match.homeTeam}</span>}
        <span className="text-secondary">vs</span>
        {awayTeam ? <TeamBadge team={awayTeam} /> : <span>{match.awayTeam}</span>}
      </span>
    )
  }

  if (!filtered.length) {
    return <p className="text-sm text-secondary">Không có trận đấu phù hợp bộ lọc.</p>
  }

  return (
    <div className="space-y-0 overflow-hidden rounded-lg border border-secondary/20 bg-surface">
      {/* Desktop */}
      <div className="hidden md:block">
        <Table className="border-0">
          <TableHead>
            <tr>
              <TableHeaderCell>Thời gian</TableHeaderCell>
              <TableHeaderCell>Trận</TableHeaderCell>
              <TableHeaderCell>Vòng</TableHeaderCell>
              <TableHeaderCell>Kết quả</TableHeaderCell>
              <TableHeaderCell />
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((match) => (
              <Fragment key={match.id}>
                <tr className="hover:bg-neutral/40">
                  <TableCell className="whitespace-nowrap text-secondary">
                    {formatMatchDateTime(match.matchTime)}
                  </TableCell>
                  <TableCell className="font-medium">{renderMatchTeams(match)}</TableCell>
                  <TableCell>
                    <StageBadge stage={match.stage} />
                  </TableCell>
                  <TableCell>{formatScore(match.homeScore, match.awayScore)}</TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setExpandedId(expandedId === match.id ? null : match.id)
                      }
                    >
                      {expandedId === match.id ? 'Ẩn' : 'Dự đoán'}
                    </Button>
                  </TableCell>
                </tr>
                {expandedId === match.id && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <PredictionMatrix
                        matchId={match.id}
                        usersById={usersById}
                        isExpanded
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-secondary/10 md:hidden">
        {filtered.map((match) => (
          <div key={match.id}>
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StageBadge stage={match.stage} />
                <span className="text-xs text-secondary">
                  {formatMatchDateTime(match.matchTime)}
                </span>
              </div>
              <p className="font-semibold text-primary">{renderMatchTeams(match)}</p>
              <p className="text-sm">
                Kết quả: <span className="font-medium">{formatScore(match.homeScore, match.awayScore)}</span>
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
              >
                {expandedId === match.id ? 'Ẩn dự đoán' : 'Xem dự đoán'}
              </Button>
            </div>
            <PredictionMatrix
              matchId={match.id}
              usersById={usersById}
              isExpanded={expandedId === match.id}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
