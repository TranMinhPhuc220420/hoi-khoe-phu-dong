import { create } from 'zustand'
import * as matchesService from '../services/matches.service.js'
import * as usersService from '../services/users.service.js'
import * as transactionsService from '../services/transactions.service.js'
import * as teamsService from '../services/teams.service.js'

const TTL_MS = 60_000

/**
 * @template T
 * @param {T | null} cached
 * @param {number} fetchedAt
 * @param {boolean} force
 */
function isStale(cached, fetchedAt, force) {
  if (force || !cached) return true
  return Date.now() - fetchedAt > TTL_MS
}

export const useDataStore = create((set, get) => ({
  users: /** @type {import('../types/index.js').User[] | null} */ (null),
  matches: /** @type {import('../types/index.js').Match[] | null} */ (null),
  teams: /** @type {import('../types/index.js').Team[] | null} */ (null),
  transactions: /** @type {import('../types/index.js').Transaction[] | null} */ (null),
  usersFetchedAt: 0,
  matchesFetchedAt: 0,
  teamsFetchedAt: 0,
  transactionsFetchedAt: 0,
  loading: { users: false, matches: false, teams: false, transactions: false },
  errors: { users: null, matches: null, teams: null, transactions: null },

  fetchUsers: async (force = false) => {
    const state = get()
    if (!isStale(state.users, state.usersFetchedAt, force)) return state.users

    set((s) => ({ loading: { ...s.loading, users: true }, errors: { ...s.errors, users: null } }))
    try {
      const users = await usersService.getAll()
      set({
        users,
        usersFetchedAt: Date.now(),
        loading: { ...get().loading, users: false },
      })
      return users
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thành viên'
      set((s) => ({
        loading: { ...s.loading, users: false },
        errors: { ...s.errors, users: message },
      }))
      throw err
    }
  },

  fetchMatches: async (force = false) => {
    const state = get()
    if (!isStale(state.matches, state.matchesFetchedAt, force)) return state.matches

    set((s) => ({ loading: { ...s.loading, matches: true }, errors: { ...s.errors, matches: null } }))
    try {
      const matches = await matchesService.getAll()
      set({
        matches,
        matchesFetchedAt: Date.now(),
        loading: { ...get().loading, matches: false },
      })
      return matches
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải trận đấu'
      set((s) => ({
        loading: { ...s.loading, matches: false },
        errors: { ...s.errors, matches: message },
      }))
      throw err
    }
  },

  fetchTeams: async (force = false) => {
    const state = get()
    if (!isStale(state.teams, state.teamsFetchedAt, force)) return state.teams

    set((s) => ({ loading: { ...s.loading, teams: true }, errors: { ...s.errors, teams: null } }))
    try {
      const teams = await teamsService.getAll()
      set({
        teams,
        teamsFetchedAt: Date.now(),
        loading: { ...get().loading, teams: false },
      })
      return teams
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải đội bóng'
      set((s) => ({
        loading: { ...s.loading, teams: false },
        errors: { ...s.errors, teams: message },
      }))
      throw err
    }
  },

  fetchTransactions: async (force = false) => {
    const state = get()
    if (!isStale(state.transactions, state.transactionsFetchedAt, force)) return state.transactions

    set((s) => ({
      loading: { ...s.loading, transactions: true },
      errors: { ...s.errors, transactions: null },
    }))
    try {
      const transactions = await transactionsService.getAll()
      set({
        transactions,
        transactionsFetchedAt: Date.now(),
        loading: { ...get().loading, transactions: false },
      })
      return transactions
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải giao dịch'
      set((s) => ({
        loading: { ...s.loading, transactions: false },
        errors: { ...s.errors, transactions: message },
      }))
      throw err
    }
  },
}))
