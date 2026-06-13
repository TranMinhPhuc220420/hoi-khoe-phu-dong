/**
 * @param {string} name
 * @returns {string}
 */
export function getUserInitials(name) {
  const trimmed = name.trim()
  if (!trimmed) return '?'

  const normalized = trimmed.replace(/\([^)]*\)/g, '').trim()
  const words = normalized.split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return trimmed.charAt(0).toUpperCase() || '?'
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }

  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isValidAvatarUrl(url) {
  const trimmed = url.trim()
  if (!trimmed) return true
  return /^https?:\/\//i.test(trimmed)
}
