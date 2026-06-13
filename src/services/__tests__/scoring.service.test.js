import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = {
  match: null,
  users: new Map(),
  predictions: new Map(),
  transactions: [],
}

vi.mock('../matches.service.js', () => ({
  getById: vi.fn(async (id) => (state.match?.id === id ? state.match : null)),
  getAll: vi.fn(async () => (state.match ? [state.match] : [])),
}))

vi.mock('../predictions.service.js', () => ({
  getByMatch: vi.fn(async (matchId) =>
    [...state.predictions.values()].filter((p) => p.matchId === matchId),
  ),
  getAll: vi.fn(async () => [...state.predictions.values()]),
  getByUser: vi.fn(async (userId) =>
    [...state.predictions.values()].filter((p) => p.userId === userId),
  ),
  update: vi.fn(async (id, data) => {
    const existing = state.predictions.get(id)
    if (existing) state.predictions.set(id, { ...existing, ...data })
  }),
}))

vi.mock('../users.service.js', () => ({
  getAll: vi.fn(async () => [...state.users.values()]),
  getById: vi.fn(async (id) => state.users.get(id) ?? null),
  updateTotals: vi.fn(async (id, { totalPoints, totalPenalty }) => {
    const user = state.users.get(id)
    if (user) {
      state.users.set(id, { ...user, totalPoints, totalPenalty })
    }
  }),
}))

vi.mock('../transactions.service.js', () => ({
  create: vi.fn(async (tx) => {
    state.transactions.push({ ...tx, id: `tx-${state.transactions.length + 1}` })
  }),
  deleteByMatchId: vi.fn(async (matchId) => {
    state.transactions = state.transactions.filter((tx) => tx.matchId !== matchId)
  }),
  deleteAllPenalties: vi.fn(async () => {
    state.transactions = state.transactions.filter((tx) => tx.type !== 'penalty')
  }),
}))

import { recalculateMatch } from '../scoring.service.js'
import * as transactionsService from '../transactions.service.js'
import * as usersService from '../users.service.js'

const MATCH_ID = 'match-1'

/** @param {Partial<import('../../types/index.js').Match>} overrides */
function createMatch(overrides = {}) {
  return {
    id: MATCH_ID,
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    matchTime: new Date(),
    stage: 'group',
    homeScore: 2,
    awayScore: 1,
    isFinished: true,
    ...overrides,
  }
}

/** @param {string} id @param {{ totalPoints?: number, totalPenalty?: number }} [totals] */
function createUser(id, totals = {}) {
  return {
    id,
    name: id,
    totalPoints: totals.totalPoints ?? 0,
    totalPenalty: totals.totalPenalty ?? 0,
    paidAmount: 0,
  }
}

/**
 * @param {string} id
 * @param {string} userId
 * @param {{ predictedHome: number, predictedAway: number, isStar?: boolean, pointsEarned?: number, penaltyAmount?: number }} data
 */
function createPrediction(id, userId, data) {
  return {
    id,
    matchId: MATCH_ID,
    userId,
    predictedHome: data.predictedHome,
    predictedAway: data.predictedAway,
    isStar: data.isStar ?? false,
    pointsEarned: data.pointsEarned ?? 0,
    penaltyAmount: data.penaltyAmount ?? 0,
  }
}

function resetState() {
  state.match = null
  state.users = new Map()
  state.predictions = new Map()
  state.transactions = []
  vi.clearAllMocks()
}

describe('scoring.service — recalculateMatch', () => {
  beforeEach(() => {
    resetState()
  })

  it('D-01 applies score, penalty, and transaction on first confirm', async () => {
    state.match = createMatch()
    state.users.set('u1', createUser('u1'))
    state.predictions.set(
      'p1',
      createPrediction('p1', 'u1', { predictedHome: 2, predictedAway: 1 }),
    )

    await recalculateMatch(MATCH_ID)

    const user = state.users.get('u1')
    const prediction = state.predictions.get('p1')

    expect(prediction?.pointsEarned).toBe(5)
    expect(prediction?.penaltyAmount).toBe(0)
    expect(user?.totalPoints).toBe(5)
    expect(user?.totalPenalty).toBe(0)
    expect(state.transactions).toHaveLength(0)
  })

  it('D-01b creates penalty transaction when not exact score', async () => {
    state.match = createMatch()
    state.users.set('u1', createUser('u1'))
    state.predictions.set(
      'p1',
      createPrediction('p1', 'u1', { predictedHome: 2, predictedAway: 1 }),
    )
    state.match = createMatch({ homeScore: 3, awayScore: 1 })

    await recalculateMatch(MATCH_ID)

    const user = state.users.get('u1')
    const prediction = state.predictions.get('p1')

    expect(prediction?.pointsEarned).toBe(3)
    expect(prediction?.penaltyAmount).toBe(10_000)
    expect(user?.totalPoints).toBe(3)
    expect(user?.totalPenalty).toBe(10_000)
    expect(state.transactions).toHaveLength(1)
    expect(state.transactions[0]).toMatchObject({
      userId: 'u1',
      amount: 10_000,
      type: 'penalty',
      matchId: MATCH_ID,
    })
  })

  it('D-02 recalculating same result does not double-count', async () => {
    state.match = createMatch()
    state.users.set('u1', createUser('u1'))
    state.predictions.set(
      'p1',
      createPrediction('p1', 'u1', { predictedHome: 3, predictedAway: 1 }),
    )

    await recalculateMatch(MATCH_ID)
    await recalculateMatch(MATCH_ID)

    expect(state.users.get('u1')?.totalPoints).toBe(3)
    expect(state.users.get('u1')?.totalPenalty).toBe(10_000)
    expect(state.transactions).toHaveLength(1)
    expect(transactionsService.deleteByMatchId).toHaveBeenCalledTimes(2)
  })

  it('D-03 updates penalty when result changes from exact to correct outcome', async () => {
    state.match = createMatch({ homeScore: 2, awayScore: 1 })
    state.users.set('u1', createUser('u1'))
    state.predictions.set(
      'p1',
      createPrediction('p1', 'u1', { predictedHome: 2, predictedAway: 1 }),
    )

    await recalculateMatch(MATCH_ID)
    expect(state.users.get('u1')?.totalPenalty).toBe(0)

    state.match = createMatch({ homeScore: 3, awayScore: 1 })
    await recalculateMatch(MATCH_ID)

    expect(state.predictions.get('p1')?.pointsEarned).toBe(3)
    expect(state.predictions.get('p1')?.penaltyAmount).toBe(10_000)
    expect(state.users.get('u1')?.totalPoints).toBe(3)
    expect(state.users.get('u1')?.totalPenalty).toBe(10_000)
    expect(state.transactions).toHaveLength(1)
  })

  it('D-04 only scores users with predictions', async () => {
    state.match = createMatch()
    state.users.set('u1', createUser('u1'))
    state.users.set('u2', createUser('u2'))
    state.predictions.set(
      'p1',
      createPrediction('p1', 'u1', { predictedHome: 2, predictedAway: 1 }),
    )

    await recalculateMatch(MATCH_ID)

    expect(state.users.get('u1')?.totalPoints).toBe(5)
    expect(state.users.get('u2')?.totalPoints).toBe(0)
    expect(state.users.get('u2')?.totalPenalty).toBe(0)
  })

  it('D-05 scores multiple users independently on same match', async () => {
    state.match = createMatch({ stage: 'quarter', homeScore: 2, awayScore: 1 })
    state.users.set('u-exact', createUser('u-exact'))
    state.users.set('u-outcome', createUser('u-outcome'))
    state.users.set('u-star-wrong', createUser('u-star-wrong'))

    state.predictions.set(
      'p-exact',
      createPrediction('p-exact', 'u-exact', { predictedHome: 2, predictedAway: 1 }),
    )
    state.predictions.set(
      'p-outcome',
      createPrediction('p-outcome', 'u-outcome', { predictedHome: 3, predictedAway: 0 }),
    )
    state.predictions.set(
      'p-star',
      createPrediction('p-star', 'u-star-wrong', {
        predictedHome: 0,
        predictedAway: 0,
        isStar: true,
      }),
    )

    await recalculateMatch(MATCH_ID)

    expect(state.users.get('u-exact')).toMatchObject({ totalPoints: 5, totalPenalty: 0 })
    expect(state.users.get('u-outcome')).toMatchObject({
      totalPoints: 3,
      totalPenalty: 25_000,
    })
    expect(state.users.get('u-star-wrong')).toMatchObject({
      totalPoints: -3,
      totalPenalty: 25_000,
    })
    expect(state.transactions).toHaveLength(2)
  })

  it('D-06 skips orphan prediction when user missing', async () => {
    state.match = createMatch()
    state.predictions.set(
      'p1',
      createPrediction('p1', 'missing-user', { predictedHome: 2, predictedAway: 1 }),
    )

    await expect(recalculateMatch(MATCH_ID)).resolves.toBeUndefined()
    expect(usersService.updateTotals).not.toHaveBeenCalled()
  })

  it('throws when match not found', async () => {
    state.match = null
    await expect(recalculateMatch('unknown')).rejects.toThrow('Match unknown not found')
  })

  it('throws when match missing scores', async () => {
    state.match = createMatch({ homeScore: null, awayScore: null })
    await expect(recalculateMatch(MATCH_ID)).rejects.toThrow('Match chưa có kết quả đầy đủ')
  })

  it('returns early when match not finished', async () => {
    state.match = createMatch({ isFinished: false })
    state.users.set('u1', createUser('u1'))
    state.predictions.set(
      'p1',
      createPrediction('p1', 'u1', { predictedHome: 2, predictedAway: 1 }),
    )

    await recalculateMatch(MATCH_ID)

    expect(state.users.get('u1')?.totalPoints).toBe(0)
    expect(transactionsService.create).not.toHaveBeenCalled()
  })
})
