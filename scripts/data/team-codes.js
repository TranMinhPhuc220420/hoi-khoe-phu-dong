/** @type {Record<string, string | null>} */
export const TEAM_COUNTRY_CODES = {
  Mexico: 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'UEFA Play-off D': null,
  Canada: 'ca',
  'UEFA Play-off A': null,
  Qatar: 'qa',
  Switzerland: 'ch',
  Brazil: 'br',
  Morocco: 'ma',
  Haiti: 'ht',
  Scotland: 'gb-sct',
  USA: 'us',
  Paraguay: 'py',
  Australia: 'au',
  'UEFA Play-off C': null,
  Germany: 'de',
  Curaçao: 'cw',
  'Ivory Coast': 'ci',
  Ecuador: 'ec',
  Netherlands: 'nl',
  Japan: 'jp',
  'UEFA Play-off B': null,
  Tunisia: 'tn',
  Belgium: 'be',
  Egypt: 'eg',
  Iran: 'ir',
  'New Zealand': 'nz',
  Spain: 'es',
  'Cape Verde': 'cv',
  'Saudi Arabia': 'sa',
  Uruguay: 'uy',
  France: 'fr',
  Senegal: 'sn',
  Norway: 'no',
  'FIFA Play-off 2': null,
  Argentina: 'ar',
  Algeria: 'dz',
  Austria: 'at',
  Jordan: 'jo',
  Portugal: 'pt',
  Uzbekistan: 'uz',
  Colombia: 'co',
  'FIFA Play-off 1': null,
  England: 'gb-eng',
  Croatia: 'hr',
  Ghana: 'gh',
  Panama: 'pa',
}

/**
 * @param {string} name
 * @returns {string | null}
 */
export function getCountryCodeForTeam(name) {
  return TEAM_COUNTRY_CODES[name] ?? null
}
