import { beforeEach, describe, expect, it, vi } from 'vitest'

const { state, updateMatch } = vi.hoisted(() => ({
  state: {
    predictions: [],
  },
  updateMatch: vi.fn(async () => {}),
}))

vi.mock('../firebase.js', () => ({ db: {} }))

vi.mock('../matches.service.js', () => ({
  getById: vi.fn(async (id) => ({
    id,
    stage: 'group',
    homeTeam: 'A',
    awayTeam: 'B',
  })),
  update: updateMatch,
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'predictions'),
  query: vi.fn((...args) => args),
  where: vi.fn((field, _op, value) => ({ field, value })),
  getDocs: vi.fn(async (queryArgs) => {
    const whereClause = queryArgs.find((arg) => arg?.field)
    let items = state.predictions
    if (whereClause?.field === 'matchId') {
      items = items.filter((p) => p.matchId === whereClause.value)
    } else if (whereClause?.field === 'userId') {
      items = items.filter((p) => p.userId === whereClause.value)
    }
    return {
      docs: items.map((p) => ({
        id: p.id,
        data: () => {
          const { id: _id, ...rest } = p
          return rest
        },
      })),
    }
  }),
  getDoc: vi.fn(async (id) => {
    const prediction = state.predictions.find((p) => p.id === id)
    return {
      exists: () => Boolean(prediction),
      id,
      data: () => {
        if (!prediction) return undefined
        const { id: _id, ...rest } = prediction
        return rest
      },
    }
  }),
  doc: vi.fn((_db, _col, id) => id),
  addDoc: vi.fn(async (_col, data) => {
    const id = `p-${state.predictions.length + 1}`
    state.predictions.push({ id, ...data })
    return { id }
  }),
  updateDoc: vi.fn(async (ref, data) => {
    const id = typeof ref === 'string' ? ref : ref.id
    const prediction = state.predictions.find((p) => p.id === id)
    if (prediction) Object.assign(prediction, data)
  }),
  deleteDoc: vi.fn(async (id) => {
    state.predictions = state.predictions.filter((p) => p.id !== id)
  }),
  serverTimestamp: vi.fn(() => new Date()),
}))

import { upsertBatch } from '../predictions.service.js'

const MATCH_ID = 'match-1'

function resetState() {
  state.predictions = []
  updateMatch.mockClear()
}

describe('predictions.service — upsertBatch', () => {
  beforeEach(() => {
    resetState()
  })

  it('creates prediction when hasParticipated and scores filled', async () => {
    await upsertBatch(MATCH_ID, [
      {
        userId: 'u1',
        hasParticipated: true,
        predictedHome: 2,
        predictedAway: 1,
        isStar: false,
      },
    ])

    expect(state.predictions).toHaveLength(1)
    expect(state.predictions[0]).toMatchObject({
      matchId: MATCH_ID,
      userId: 'u1',
      predictedHome: 2,
      predictedAway: 1,
    })
    expect(updateMatch).toHaveBeenCalledWith(MATCH_ID, { nonParticipatingUserIds: [] })
  })

  it('removes prediction when hasParticipated is false', async () => {
    state.predictions.push({
      id: 'p1',
      matchId: MATCH_ID,
      userId: 'u1',
      predictedHome: 1,
      predictedAway: 0,
      isStar: false,
    })

    await upsertBatch(MATCH_ID, [
      {
        userId: 'u1',
        hasParticipated: false,
        predictedHome: null,
        predictedAway: null,
        isStar: false,
      },
    ])

    expect(state.predictions).toHaveLength(0)
    expect(updateMatch).toHaveBeenCalledWith(MATCH_ID, { nonParticipatingUserIds: ['u1'] })
  })

  it('skips row with hasParticipated true but empty scores', async () => {
    await upsertBatch(MATCH_ID, [
      {
        userId: 'u1',
        hasParticipated: true,
        predictedHome: null,
        predictedAway: null,
        isStar: false,
      },
    ])

    expect(state.predictions).toHaveLength(0)
  })
})
