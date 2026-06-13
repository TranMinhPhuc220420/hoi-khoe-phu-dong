import { describe, expect, it } from 'vitest'
import {
  aggregateFinance,
  getMemberBalance,
  getMemberCredit,
  getMemberDebt,
} from '../finance.js'

const user = (totalPenalty, paidAmount) => ({ totalPenalty, paidAmount })

describe('getMemberBalance', () => {
  it('returns debt when unpaid', () => {
    expect(getMemberBalance(user(20_000, 0))).toBe(20_000)
  })

  it('returns zero when fully paid', () => {
    expect(getMemberBalance(user(20_000, 20_000))).toBe(0)
  })

  it('returns negative when overpaid', () => {
    expect(getMemberBalance(user(20_000, 30_000))).toBe(-10_000)
  })
})

describe('getMemberDebt', () => {
  it('returns outstanding debt', () => {
    expect(getMemberDebt(user(20_000, 5_000))).toBe(15_000)
  })

  it('returns zero when overpaid or settled', () => {
    expect(getMemberDebt(user(20_000, 20_000))).toBe(0)
    expect(getMemberDebt(user(20_000, 30_000))).toBe(0)
  })
})

describe('getMemberCredit', () => {
  it('returns prepaid surplus', () => {
    expect(getMemberCredit(user(20_000, 30_000))).toBe(10_000)
  })

  it('returns zero when in debt or settled', () => {
    expect(getMemberCredit(user(20_000, 5_000))).toBe(0)
    expect(getMemberCredit(user(20_000, 20_000))).toBe(0)
  })
})

describe('aggregateFinance', () => {
  it('sums debt and credit per member without netting', () => {
    const result = aggregateFinance([
      user(20_000, 5_000),
      user(10_000, 15_000),
      user(0, 0),
    ])

    expect(result).toEqual({
      totalPenalty: 30_000,
      totalPaid: 20_000,
      totalDebt: 15_000,
      totalCredit: 5_000,
    })
  })
})
