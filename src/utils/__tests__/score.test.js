import { describe, expect, it } from 'vitest'
import { calculateBasePoints, calculateScore } from '../score.js'
import { calculatePenalty } from '../penalty.js'

const pred = (home, away, isStar = false) => ({
  predictedHome: home,
  predictedAway: away,
  isStar,
})

const result = (home, away) => ({ homeScore: home, awayScore: away })

describe('calculateBasePoints & calculateScore', () => {
  it('1: exact score, no star → 5 points, 0 penalty', () => {
    const p = pred(2, 1)
    const r = result(2, 1)
    expect(calculateBasePoints(p, r)).toBe(5)
    expect(calculateScore(p, r, 'group')).toBe(5)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(0)
  })

  it('2: correct result only → 3 points, 10k penalty (group)', () => {
    const p = pred(2, 1)
    const r = result(3, 1)
    expect(calculateBasePoints(p, r)).toBe(3)
    expect(calculateScore(p, r, 'group')).toBe(3)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(10_000)
  })

  it('3: wrong prediction → 0 points, 10k penalty (group)', () => {
    const p = pred(2, 1)
    const r = result(0, 0)
    expect(calculateScore(p, r, 'group')).toBe(0)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(10_000)
  })

  it('4: star + wrong → -3 points, 10k penalty (group)', () => {
    const p = pred(2, 1, true)
    const r = result(0, 0)
    expect(calculateScore(p, r, 'group')).toBe(-3)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(10_000)
  })

  it('5: same outcome different score → 3 points (group)', () => {
    const p = pred(1, 1)
    const r = result(2, 2)
    expect(calculateScore(p, r, 'group')).toBe(3)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(10_000)
  })

  it('6: final exact score → 10 points, 0 penalty', () => {
    const p = pred(1, 0)
    const r = result(1, 0)
    expect(calculateScore(p, r, 'final')).toBe(10)
    expect(calculatePenalty(calculateBasePoints(p, r), 'final')).toBe(0)
  })

  it('7: final correct result only → 6 points, 50k penalty', () => {
    const p = pred(2, 0)
    const r = result(1, 0)
    expect(calculateScore(p, r, 'final')).toBe(6)
    expect(calculatePenalty(calculateBasePoints(p, r), 'final')).toBe(50_000)
  })

  it('8: star + exact score → 10 points, 0 penalty', () => {
    const p = pred(2, 1, true)
    const r = result(2, 1)
    expect(calculateScore(p, r, 'group')).toBe(10)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(0)
  })

  it('correct result + star → doubled score, still penalized', () => {
    const p = pred(2, 1, true)
    const r = result(3, 1)
    expect(calculateScore(p, r, 'group')).toBe(6)
    expect(calculatePenalty(calculateBasePoints(p, r), 'group')).toBe(10_000)
  })
})

describe('calculatePenalty by stage', () => {
  it('exact score always 0 penalty regardless of stage', () => {
    expect(calculatePenalty(5, 'final')).toBe(0)
    expect(calculatePenalty(5, 'semi')).toBe(0)
  })

  it('non-exact scores use stage rates', () => {
    expect(calculatePenalty(3, 'round32')).toBe(15_000)
    expect(calculatePenalty(0, 'quarter')).toBe(25_000)
    expect(calculatePenalty(3, 'third')).toBe(35_000)
  })
})
