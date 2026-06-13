import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { TeamBadge, sortTeamsForSelect } from './TeamBadge.jsx'

const labelClassName = 'text-[0.72rem] font-semibold uppercase tracking-wide text-secondary'

const triggerClassName =
  'flex w-full items-center justify-between gap-2 rounded-md border border-secondary/40 bg-surface px-3 py-2.5 text-left text-primary transition-colors hover:border-secondary/60 focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20 disabled:cursor-not-allowed disabled:opacity-50'

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeSearch(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/**
 * @param {import('../../types/index.js').Team} team
 * @param {string} query
 * @returns {boolean}
 */
function teamMatchesQuery(team, query) {
  if (!query) return true
  const name = normalizeSearch(team.name)
  const group = normalizeSearch(team.group ?? '')
  return name.includes(query) || group.includes(query)
}

/**
 * @param {{
 *   id?: string
 *   label?: string
 *   teams: import('../../types/index.js').Team[]
 *   value: string
 *   onChange: (teamId: string) => void
 *   placeholder?: string
 *   disabled?: boolean
 *   excludeTeamId?: string
 *   required?: boolean
 * }} props
 */
export function TeamSelect({
  id,
  label,
  teams,
  value,
  onChange,
  placeholder = 'Chọn đội',
  disabled = false,
  excludeTeamId,
  required = false,
}) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const listboxId = `${controlId}-listbox`
  const searchId = `${controlId}-search`

  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const searchRef = useRef(/** @type {HTMLInputElement | null} */ (null))
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
  const selectedTeam = value ? teamsById[value] : null

  const normalizedQuery = normalizeSearch(query)

  const filteredTeams = useMemo(() => {
    return sortTeamsForSelect(teams).filter((team) => {
      if (excludeTeamId && team.id === excludeTeamId) return false
      return teamMatchesQuery(team, normalizedQuery)
    })
  }, [teams, excludeTeamId, normalizedQuery])

  const groupedTeams = useMemo(() => {
    /** @type {Map<string, import('../../types/index.js').Team[]>} */
    const groups = new Map()

    for (const team of filteredTeams) {
      const groupLabel = team.group ?? 'Khác'
      const items = groups.get(groupLabel) ?? []
      items.push(team)
      groups.set(groupLabel, items)
    }

    return groups
  }, [filteredTeams])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(/** @type {Node} */ (event.target))) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const closeDropdown = () => {
    setOpen(false)
    setQuery('')
  }

  const handleSelect = (teamId) => {
    onChange(teamId)
    closeDropdown()
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={controlId} className={labelClassName}>
          {label}
        </label>
      ) : null}

      <button
        id={controlId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={triggerClassName}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedTeam ? (
            <TeamBadge team={selectedTeam} className="font-medium text-primary" />
          ) : (
            <span className="text-secondary/70">{placeholder}</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {required ? (
        <input
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          value={value}
          onChange={() => {}}
          required
        />
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-secondary/30 bg-surface shadow-lg">
          <div className="border-b border-secondary/15 p-2">
            <label htmlFor={searchId} className="sr-only">
              Tìm đội theo tên hoặc bảng
            </label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/70"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc bảng..."
                className="w-full rounded-md border border-secondary/30 bg-neutral/40 py-2 pl-9 pr-3 text-sm text-primary placeholder:text-secondary/60 focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    closeDropdown()
                  }
                }}
              />
            </div>
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label={label ?? placeholder}
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredTeams.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-secondary">
                Không tìm thấy đội phù hợp
              </li>
            ) : (
              [...groupedTeams.entries()].map(([groupLabel, groupTeams]) => (
                <li key={groupLabel} role="presentation">
                  <p className="sticky top-0 z-10 bg-neutral/95 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-secondary/80 backdrop-blur-sm">
                    Bảng {groupLabel}
                  </p>
                  <ul role="group" aria-label={`Bảng ${groupLabel}`}>
                    {groupTeams.map((team) => {
                      const isSelected = team.id === value

                      return (
                        <li key={team.id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral/70 ${
                              isSelected ? 'bg-tertiary/10 text-primary' : 'text-primary'
                            }`}
                            onClick={() => handleSelect(team.id)}
                          >
                            <TeamBadge team={team} className="min-w-0 flex-1 font-medium" />
                            {isSelected ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-4 w-4 shrink-0 text-tertiary"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
