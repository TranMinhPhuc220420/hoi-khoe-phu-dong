import { describe, expect, it } from 'vitest'
import { getUserInitials, isValidAvatarUrl } from '../userAvatar.js'
import { normalizeAvatarUrl } from '../../services/users.service.js'

describe('getUserInitials', () => {
  it('returns first letter for single word', () => {
    expect(getUserInitials('Phuc (Leopard)')).toBe('P')
  })

  it('returns first and last word initials for multiple words', () => {
    expect(getUserInitials('Hoa Le')).toBe('HL')
    expect(getUserInitials('tran quoc dat')).toBe('TD')
  })

  it('handles empty name', () => {
    expect(getUserInitials('')).toBe('?')
    expect(getUserInitials('   ')).toBe('?')
  })
})

describe('isValidAvatarUrl', () => {
  it('accepts empty values', () => {
    expect(isValidAvatarUrl('')).toBe(true)
    expect(isValidAvatarUrl('   ')).toBe(true)
  })

  it('accepts http and https URLs', () => {
    expect(isValidAvatarUrl('https://example.com/a.png')).toBe(true)
    expect(isValidAvatarUrl('http://example.com/a.png')).toBe(true)
  })

  it('rejects invalid schemes', () => {
    expect(isValidAvatarUrl('ftp://example.com/a.png')).toBe(false)
    expect(isValidAvatarUrl('not-a-url')).toBe(false)
  })
})

describe('normalizeAvatarUrl', () => {
  it('trims and converts empty to null', () => {
    expect(normalizeAvatarUrl('  https://x.test/a.png  ')).toBe('https://x.test/a.png')
    expect(normalizeAvatarUrl('')).toBe(null)
    expect(normalizeAvatarUrl(null)).toBe(null)
    expect(normalizeAvatarUrl(undefined)).toBe(null)
  })
})
