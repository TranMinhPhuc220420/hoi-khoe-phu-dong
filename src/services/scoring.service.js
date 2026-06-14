import { formatAbsentPenaltyNote, isAbsentPenaltyNote } from '../constants/scoring.js'
import { getPenaltyByStage } from '../constants/penalty-rates.js'
import { calculateBasePoints, calculateScore } from '../utils/score.js'
import { calculatePenalty } from '../utils/penalty.js'
import { countStarsUsed } from '../utils/star.js'
import * as matchesService from './matches.service.js'
import * as predictionsService from './predictions.service.js'
import * as transactionsService from './transactions.service.js'
import * as usersService from './users.service.js'

/**
 * @param {string} userId
 * @param {import('../types/index.js').MatchStage} stage
 * @param {string} [excludePredictionId]
 * @returns {Promise<number>}
 */
export async function getUserStarCount(userId, stage, excludePredictionId) {
  const predictions = await predictionsService.getByUser(userId)
  const matchIds = [...new Set(predictions.map((p) => p.matchId))]
  const matches = await Promise.all(matchIds.map((id) => matchesService.getById(id)))
  const stageByMatchId = Object.fromEntries(
    matches.filter(Boolean).map((m) => [m.id, m.stage]),
  )

  const inStage = predictions.filter((p) => stageByMatchId[p.matchId] === stage)
  return countStarsUsed(inStage, userId, excludePredictionId)
}

/**
 * @param {import('../types/index.js').Match} match
 * @param {import('../types/index.js').Prediction[]} predictions
 */
async function applyMatchScoring(match, predictions) {
  if (match.homeScore == null || match.awayScore == null) return

  const result = { homeScore: match.homeScore, awayScore: match.awayScore }

  for (const prediction of predictions) {
    const basePoints = calculateBasePoints(prediction, result)
    const pointsEarned = calculateScore(prediction, result, match.stage)
    const penaltyAmount = calculatePenalty(basePoints, match.stage)

    const user = await usersService.getById(prediction.userId)
    if (!user) continue

    await usersService.updateTotals(prediction.userId, {
      totalPoints: user.totalPoints + pointsEarned,
      totalPenalty: user.totalPenalty + penaltyAmount,
    })

    await predictionsService.update(prediction.id, {
      pointsEarned,
      penaltyAmount,
    })

    if (penaltyAmount > 0) {
      await transactionsService.create({
        userId: prediction.userId,
        amount: penaltyAmount,
        type: 'penalty',
        note: `${match.stage}: ${match.homeTeam} vs ${match.awayTeam}`,
        matchId: match.id,
      })
    }
  }

  const allUsers = await usersService.getAll()
  const predictedUserIds = new Set(predictions.map((p) => p.userId))

  for (const user of allUsers) {
    if (predictedUserIds.has(user.id)) continue

    const penaltyAmount = getPenaltyByStage(match.stage)
    if (penaltyAmount <= 0) continue

    await usersService.updateTotals(user.id, {
      totalPoints: user.totalPoints,
      totalPenalty: user.totalPenalty + penaltyAmount,
    })

    await transactionsService.create({
      userId: user.id,
      amount: penaltyAmount,
      type: 'penalty',
      note: formatAbsentPenaltyNote(match.stage, match.homeTeam, match.awayTeam),
      matchId: match.id,
    })
  }
}

/**
 * Reverse prior scoring for a match (idempotent recalc).
 * @param {string} matchId
 * @param {import('../types/index.js').Prediction[]} predictions
 */
async function reverseMatchScoring(matchId, predictions) {
  const predictedUserIds = new Set(predictions.map((p) => p.userId))

  for (const prediction of predictions) {
    const pointsEarned = prediction.pointsEarned ?? 0
    const penaltyAmount = prediction.penaltyAmount ?? 0

    if (pointsEarned === 0 && penaltyAmount === 0) continue

    const user = await usersService.getById(prediction.userId)
    if (!user) continue

    await usersService.updateTotals(prediction.userId, {
      totalPoints: user.totalPoints - pointsEarned,
      totalPenalty: user.totalPenalty - penaltyAmount,
    })
  }

  const transactions = await transactionsService.getByMatchId(matchId)
  for (const tx of transactions) {
    if (tx.type !== 'penalty') continue

    const isAbsentTx = isAbsentPenaltyNote(tx.note)
    if (predictedUserIds.has(tx.userId) && !isAbsentTx) continue

    const user = await usersService.getById(tx.userId)
    if (!user) continue

    await usersService.updateTotals(tx.userId, {
      totalPoints: user.totalPoints,
      totalPenalty: user.totalPenalty - tx.amount,
    })
  }

  await transactionsService.deleteByMatchId(matchId)
}

/**
 * @param {string} matchId
 * @returns {Promise<void>}
 */
export async function recalculateMatch(matchId) {
  const match = await matchesService.getById(matchId)
  if (!match) throw new Error(`Match ${matchId} not found`)
  if (!match.isFinished) return
  if (match.homeScore == null || match.awayScore == null) {
    throw new Error('Match chưa có kết quả đầy đủ')
  }

  const predictions = await predictionsService.getByMatch(matchId)

  await reverseMatchScoring(matchId, predictions)
  await applyMatchScoring(match, predictions)
}

/** @returns {Promise<void>} */
export async function recalculateAll() {
  const users = await usersService.getAll()
  await Promise.all(
    users.map((user) =>
      usersService.updateTotals(user.id, { totalPoints: 0, totalPenalty: 0 }),
    ),
  )

  await transactionsService.deleteAllPenalties()

  const allPredictions = await predictionsService.getAll()
  await Promise.all(
    allPredictions.map((p) =>
      predictionsService.update(p.id, { pointsEarned: 0, penaltyAmount: 0 }),
    ),
  )

  const matches = await matchesService.getAll()
  const finished = matches.filter(
    (m) => m.isFinished && m.homeScore != null && m.awayScore != null,
  )

  for (const match of finished) {
    const predictions = await predictionsService.getByMatch(match.id)
    await applyMatchScoring(match, predictions)
  }
}
