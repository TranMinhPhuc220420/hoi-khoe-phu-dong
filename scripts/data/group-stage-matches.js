/**
 * WC 2026 group stage placeholder — 12 groups × 6 matches = 72 matches.
 * Team names are placeholders based on the 48-team format; update when official draw is final.
 */

/** @type {Record<string, string[]>} */
export const GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'UEFA Play-off D'],
  B: ['Canada', 'UEFA Play-off A', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'UEFA Play-off C'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'UEFA Play-off B', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Norway', 'FIFA Play-off 2'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Uzbekistan', 'Colombia', 'FIFA Play-off 1'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
}

/** Round-robin pairings for 4 teams */
const ROUND_ROBIN = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
]

const GROUP_LETTERS = Object.keys(GROUPS)
const BASE_DATE = new Date('2026-06-11T16:00:00Z')

/**
 * @returns {Array<{ id: string, homeTeam: string, awayTeam: string, matchTime: Date, stage: 'group', homeScore: null, awayScore: null, isFinished: boolean, group: string }>}
 */
export function buildGroupStageMatches() {
  /** @type {ReturnType<typeof buildGroupStageMatches>} */
  const matches = []
  let dayOffset = 0

  for (const group of GROUP_LETTERS) {
    const teams = GROUPS[group]

    ROUND_ROBIN.forEach(([homeIdx, awayIdx], matchIdx) => {
      const matchDate = new Date(BASE_DATE)
      matchDate.setDate(matchDate.getDate() + dayOffset + Math.floor(matchIdx / 2))
      matchDate.setHours(16 + (matchIdx % 2) * 4)

      const homeTeam = teams[homeIdx]
      const awayTeam = teams[awayIdx]
      const id = `group-${group.toLowerCase()}-${matchIdx + 1}`

      matches.push({
        id,
        homeTeam,
        awayTeam,
        matchTime: matchDate,
        stage: 'group',
        homeScore: null,
        awayScore: null,
        isFinished: false,
        group,
      })
    })

    dayOffset += 3
  }

  return matches
}
