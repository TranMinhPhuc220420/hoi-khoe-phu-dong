/** @type {Array<{ key: 'all' | import('../types/index.js').MatchStage, label: string }>} */
export const STAGE_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'group', label: 'Vòng bảng' },
  { key: 'round32', label: 'Vòng 32' },
  { key: 'round16', label: 'Vòng 16' },
  { key: 'quarter', label: 'Tứ kết' },
  { key: 'semi', label: 'Bán kết' },
  { key: 'third', label: 'Hạng 3' },
  { key: 'final', label: 'Chung kết' },
]

/** @type {Record<import('../types/index.js').MatchStage, string>} */
export const STAGE_LABELS = {
  group: 'Vòng bảng',
  round32: 'Vòng 32',
  round16: 'Vòng 16',
  quarter: 'Tứ kết',
  semi: 'Bán kết',
  third: 'Hạng 3',
  final: 'Chung kết',
}
