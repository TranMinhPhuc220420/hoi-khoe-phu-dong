import { describe, expect, it } from 'vitest'
import { isFilledPredictionRow, isFilledPredictionScore } from '../prediction-input.js'

describe('prediction-input', () => {
  describe('isFilledPredictionScore', () => {
    it('accepts valid integers 0-99', () => {
      expect(isFilledPredictionScore(0)).toBe(true)
      expect(isFilledPredictionScore(99)).toBe(true)
    })

    it('rejects null, empty, and out-of-range values', () => {
      expect(isFilledPredictionScore(null)).toBe(false)
      expect(isFilledPredictionScore(undefined)).toBe(false)
      expect(isFilledPredictionScore(-1)).toBe(false)
      expect(isFilledPredictionScore(100)).toBe(false)
      expect(isFilledPredictionScore(1.5)).toBe(false)
    })
  })

  describe('isFilledPredictionRow', () => {
    it('returns true when both scores are valid', () => {
      expect(isFilledPredictionRow({ predictedHome: 0, predictedAway: 0 })).toBe(true)
      expect(isFilledPredictionRow({ predictedHome: 2, predictedAway: 1 })).toBe(true)
    })

    it('returns false when either score is missing or invalid', () => {
      expect(isFilledPredictionRow({ predictedHome: null, predictedAway: 0 })).toBe(false)
      expect(isFilledPredictionRow({ predictedHome: 0, predictedAway: null })).toBe(false)
      expect(isFilledPredictionRow({ predictedHome: null, predictedAway: null })).toBe(false)
      expect(isFilledPredictionRow({ predictedHome: 2, predictedAway: undefined })).toBe(false)
    })
  })
})
