import { describe, expect, it } from 'vitest'
import { canUseStar, countStarsUsed } from '../star.js'
import { STAR_LIMITS } from '../../constants/star-limits.js'

const pred = (id, userId, isStar) => ({
  id,
  userId,
  matchId: `match-${id}`,
  predictedHome: 1,
  predictedAway: 0,
  isStar,
})

const userId = 'user-1'

/** @param {import('../../types/index.js').MatchStage} stage */
function buildStarPredictions(stage, count) {
  return Array.from({ length: count }, (_, i) =>
    pred(`${stage}-p${i + 1}`, userId, true),
  )
}

describe('canUseStar — group (limit 4)', () => {
  const predictions = [
    pred('p1', userId, true),
    pred('p2', userId, true),
    pred('p3', userId, true),
    pred('p4', userId, true),
    pred('p5', userId, false),
  ]

  it('allows star when under group limit (4)', () => {
    const result = canUseStar(userId, 'group', predictions.slice(0, 3), { wantsStar: true })
    expect(result.ok).toBe(true)
  })

  it('blocks star when group limit reached', () => {
    const result = canUseStar(userId, 'group', predictions, { wantsStar: true })
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('4 sao')
  })

  it('excludes current prediction when updating', () => {
    const result = canUseStar(userId, 'group', predictions, {
      wantsStar: true,
      excludePredictionId: 'p4',
    })
    expect(result.ok).toBe(true)
  })

  it('countStarsUsed respects exclude id', () => {
    expect(countStarsUsed(predictions, userId)).toBe(4)
    expect(countStarsUsed(predictions, userId, 'p1')).toBe(3)
  })
})

describe('canUseStar — final (no star selection)', () => {
  it('blocks star on final', () => {
    const result = canUseStar(userId, 'final', [], { wantsStar: true })
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('Chung kết')
  })

  it('allows no star on final', () => {
    const result = canUseStar(userId, 'final', [], { wantsStar: false })
    expect(result.ok).toBe(true)
  })
})

describe.each([
  ['round32', 2],
  ['round16', 2],
  ['quarter', 1],
  ['semi', 1],
  ['third', 1],
])('canUseStar — %s (limit %i)', (stage, limit) => {
  it(`allows star when under limit (${limit})`, () => {
    const used = buildStarPredictions(stage, limit - 1)
    const result = canUseStar(userId, stage, used, { wantsStar: true })
    expect(result.ok).toBe(true)
    expect(result.limit).toBe(STAR_LIMITS[stage])
  })

  it(`blocks star when limit (${limit}) reached`, () => {
    const used = buildStarPredictions(stage, limit)
    const result = canUseStar(userId, stage, used, { wantsStar: true })
    expect(result.ok).toBe(false)
    expect(result.reason).toContain(`${limit} sao`)
  })

  it('allows keeping star when updating same prediction at limit', () => {
    const used = buildStarPredictions(stage, limit)
    const result = canUseStar(userId, stage, used, {
      wantsStar: true,
      excludePredictionId: `${stage}-p1`,
    })
    expect(result.ok).toBe(true)
  })
})
