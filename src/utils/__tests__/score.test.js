import { describe, expect, it } from 'vitest'
import { calculateBasePoints, calculateScore } from '../score.js'
import { calculatePenalty } from '../penalty.js'

const pred = (home, away, isStar = false) => ({
  predictedHome: home,
  predictedAway: away,
  isStar,
})

const result = (home, away) => ({ homeScore: home, awayScore: away })

/** @type {Array<[import('../../types/index.js').MatchStage, number]>} */
const STAR_STAGES = [
  ['group', 10_000],
  ['round32', 15_000],
  ['round16', 20_000],
  ['quarter', 25_000],
  ['semi', 30_000],
  ['third', 35_000],
]

/** Nhóm A — không sao, 6 kịch bản × 6 vòng (trừ final) */
describe('Nhóm A: scoring without star by stage', () => {
  it.each(STAR_STAGES)(
    'A-%s-01 exact score → 5 points, 0 penalty',
    (stage, penalty) => {
      const p = pred(2, 1)
      const r = result(2, 1)
      expect(calculateBasePoints(p, r)).toBe(5)
      expect(calculateScore(p, r, stage)).toBe(5)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(0)
      void penalty
    },
  )

  it.each(STAR_STAGES)(
    'A-%s-02 correct home win, wrong score → 3 points, stage penalty',
    (stage, penalty) => {
      const p = pred(2, 1)
      const r = result(3, 1)
      expect(calculateBasePoints(p, r)).toBe(3)
      expect(calculateScore(p, r, stage)).toBe(3)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )

  it.each(STAR_STAGES)(
    'A-%s-03 correct away win, wrong score → 3 points, stage penalty',
    (stage, penalty) => {
      const p = pred(0, 2)
      const r = result(1, 3)
      expect(calculateBasePoints(p, r)).toBe(3)
      expect(calculateScore(p, r, stage)).toBe(3)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )

  it.each(STAR_STAGES)(
    'A-%s-04 correct draw, wrong score → 3 points, stage penalty',
    (stage, penalty) => {
      const p = pred(1, 1)
      const r = result(2, 2)
      expect(calculateBasePoints(p, r)).toBe(3)
      expect(calculateScore(p, r, stage)).toBe(3)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )

  it.each(STAR_STAGES)(
    'A-%s-05 predicted win, result draw → 0 points, stage penalty',
    (stage, penalty) => {
      const p = pred(2, 1)
      const r = result(1, 1)
      expect(calculateBasePoints(p, r)).toBe(0)
      expect(calculateScore(p, r, stage)).toBe(0)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )

  it.each(STAR_STAGES)(
    'A-%s-06 predicted draw, result win → 0 points, stage penalty',
    (stage, penalty) => {
      const p = pred(1, 1)
      const r = result(2, 0)
      expect(calculateBasePoints(p, r)).toBe(0)
      expect(calculateScore(p, r, stage)).toBe(0)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )
})

/** Nhóm B — ngôi sao hy vọng, 4 kịch bản × 6 vòng */
describe('Nhóm B: star scoring by stage', () => {
  it.each(STAR_STAGES)(
    'B-%s-01 star + exact score → 10 points, 0 penalty',
    (stage) => {
      const p = pred(2, 1, true)
      const r = result(2, 1)
      expect(calculateScore(p, r, stage)).toBe(10)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(0)
    },
  )

  it.each(STAR_STAGES)(
    'B-%s-02 star + correct result → 6 points, stage penalty',
    (stage, penalty) => {
      const p = pred(2, 1, true)
      const r = result(3, 1)
      expect(calculateScore(p, r, stage)).toBe(6)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )

  it.each(STAR_STAGES)(
    'B-%s-03 star + wrong (predict win, result draw) → -3 points, stage penalty',
    (stage, penalty) => {
      const p = pred(2, 1, true)
      const r = result(1, 1)
      expect(calculateScore(p, r, stage)).toBe(-3)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )

  it.each(STAR_STAGES)(
    'B-%s-04 star + wrong (predict draw, result win) → -3 points, stage penalty',
    (stage, penalty) => {
      const p = pred(1, 1, true)
      const r = result(2, 0)
      expect(calculateScore(p, r, stage)).toBe(-3)
      expect(calculatePenalty(calculateBasePoints(p, r), stage)).toBe(penalty)
    },
  )
})

/** Nhóm C — chung kết (auto ×2) */
describe('Nhóm C: final stage', () => {
  it('C-final-01 exact score, no star → 10 points, 0 penalty', () => {
    const p = pred(1, 0)
    const r = result(1, 0)
    expect(calculateScore(p, r, 'final')).toBe(10)
    expect(calculatePenalty(calculateBasePoints(p, r), 'final')).toBe(0)
  })

  it('C-final-02 correct result only → 6 points, 50k penalty', () => {
    const p = pred(2, 0)
    const r = result(1, 0)
    expect(calculateScore(p, r, 'final')).toBe(6)
    expect(calculatePenalty(calculateBasePoints(p, r), 'final')).toBe(50_000)
  })

  it('C-final-03 wrong prediction → 0 points, 50k penalty', () => {
    const p = pred(2, 1)
    const r = result(0, 0)
    expect(calculateScore(p, r, 'final')).toBe(0)
    expect(calculatePenalty(calculateBasePoints(p, r), 'final')).toBe(50_000)
  })

  it('C-final-04 isStar=true ignored → 10 points, 0 penalty', () => {
    const p = pred(1, 0, true)
    const r = result(1, 0)
    expect(calculateScore(p, r, 'final')).toBe(10)
    expect(calculatePenalty(calculateBasePoints(p, r), 'final')).toBe(0)
  })
})

describe('calculatePenalty by stage', () => {
  it('exact score always 0 penalty regardless of stage', () => {
    for (const [stage] of STAR_STAGES) {
      expect(calculatePenalty(5, stage)).toBe(0)
    }
    expect(calculatePenalty(5, 'final')).toBe(0)
  })

  it('non-exact base points use stage rates', () => {
    expect(calculatePenalty(3, 'round32')).toBe(15_000)
    expect(calculatePenalty(0, 'quarter')).toBe(25_000)
    expect(calculatePenalty(3, 'third')).toBe(35_000)
    expect(calculatePenalty(0, 'final')).toBe(50_000)
  })
})
