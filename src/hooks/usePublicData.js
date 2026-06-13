import { useCallback, useEffect } from 'react'
import { useDataStore } from '../stores/data.store.js'
import { isConfigValid } from '../services/firebase.js'
import { parseMatchTime } from '../utils/format.js'
import { getMemberBalance } from '../utils/finance.js'

/**
 * @param {{ autoFetch?: boolean }} [options]
 */
export function useUsers(options = {}) {
  const { autoFetch = true } = options
  const users = useDataStore((s) => s.users)
  const loading = useDataStore((s) => s.loading.users)
  const error = useDataStore((s) => s.errors.users)
  const fetchUsers = useDataStore((s) => s.fetchUsers)

  const refresh = useCallback(() => fetchUsers(true), [fetchUsers])

  useEffect(() => {
    if (autoFetch && isConfigValid()) {
      fetchUsers()
    }
  }, [autoFetch, fetchUsers])

  const sorted = users
    ? [...users].sort((a, b) => b.totalPoints - a.totalPoints)
    : []

  return { users: sorted, rawUsers: users, loading, error, refresh }
}

/**
 * @param {{ autoFetch?: boolean }} [options]
 */
export function useMatches(options = {}) {
  const { autoFetch = true } = options
  const matches = useDataStore((s) => s.matches)
  const loading = useDataStore((s) => s.loading.matches)
  const error = useDataStore((s) => s.errors.matches)
  const fetchMatches = useDataStore((s) => s.fetchMatches)

  const refresh = useCallback(() => fetchMatches(true), [fetchMatches])

  useEffect(() => {
    if (autoFetch && isConfigValid()) {
      fetchMatches()
    }
  }, [autoFetch, fetchMatches])

  return { matches: matches ?? [], loading, error, refresh }
}

/**
 * @param {{ autoFetch?: boolean }} [options]
 */
export function useTeams(options = {}) {
  const { autoFetch = true } = options
  const teams = useDataStore((s) => s.teams)
  const loading = useDataStore((s) => s.loading.teams)
  const error = useDataStore((s) => s.errors.teams)
  const fetchTeams = useDataStore((s) => s.fetchTeams)

  const refresh = useCallback(() => fetchTeams(true), [fetchTeams])

  useEffect(() => {
    if (autoFetch && isConfigValid()) {
      fetchTeams()
    }
  }, [autoFetch, fetchTeams])

  const teamsById = teams
    ? Object.fromEntries(teams.map((t) => [t.id, t]))
    : {}

  return { teams: teams ?? [], teamsById, loading, error, refresh }
}

/**
 * @param {{ autoFetch?: boolean }} [options]
 */
export function useTransactions(options = {}) {
  const { autoFetch = true } = options
  const transactions = useDataStore((s) => s.transactions)
  const loading = useDataStore((s) => s.loading.transactions)
  const error = useDataStore((s) => s.errors.transactions)
  const fetchTransactions = useDataStore((s) => s.fetchTransactions)

  const refresh = useCallback(() => fetchTransactions(true), [fetchTransactions])

  useEffect(() => {
    if (autoFetch && isConfigValid()) {
      fetchTransactions()
    }
  }, [autoFetch, fetchTransactions])

  return { transactions: transactions ?? [], loading, error, refresh }
}

/**
 * @param {import('../types/index.js').User[]} users
 */
export function getTopScorer(users) {
  if (!users.length) return null
  return [...users].sort((a, b) => b.totalPoints - a.totalPoints)[0]
}

/**
 * @param {import('../types/index.js').User[]} users
 */
export function getHighestDebtUser(users) {
  if (!users.length) return null
  return [...users]
    .map((u) => ({ ...u, balance: getMemberBalance(u) }))
    .filter((u) => u.balance > 0)
    .sort((a, b) => b.balance - a.balance)[0] ?? null
}

/**
 * @param {import('../types/index.js').Match[]} matches
 * @param {number} [limit=5]
 */
export function getUpcomingMatches(matches, limit = 5) {
  return matches
    .filter((m) => !m.isFinished)
    .sort((a, b) => {
      const ta = parseMatchTime(a.matchTime)?.getTime() ?? 0
      const tb = parseMatchTime(b.matchTime)?.getTime() ?? 0
      return ta - tb
    })
    .slice(0, limit)
}
