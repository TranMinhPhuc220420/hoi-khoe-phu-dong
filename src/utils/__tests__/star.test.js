import { describe, expect, it } from 'vitest'
import { canUseStar, countStarsUsed } from '../star.js'

const pred = (id, userId, isStar) => ({
  id,
  userId,
  matchId: `match-${id}`,
  predictedHome: 1,
  predictedAway: 0,
  isStar,
})

describe('canUseStar', () => {
  const userId = 'user-1'
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

  it('blocks star on final', () => {
    const result = canUseStar(userId, 'final', [], { wantsStar: true })
    expect(result.ok).toBe(false)
  })

  it('allows no star on final', () => {
    const result = canUseStar(userId, 'final', [], { wantsStar: false })
    expect(result.ok).toBe(true)
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
