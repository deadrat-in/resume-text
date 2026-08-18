import { describe, expect, it } from 'vitest'
import {
  csvLine,
  dateRange,
  filterEmpty,
  fmtDate,
  formatLocation,
  heading,
  joinSections,
  bulletList,
  renderProfiles,
} from '../src/normalize.js'

describe('fmtDate', () => {
  it('formats full ISO dates as human readable', () => {
    expect(fmtDate('2021-07-01')).toBe('July 2021')
  })

  it('formats YYYY-MM as human readable', () => {
    expect(fmtDate('2021-07')).toBe('July 2021')
  })

  it('formats YYYY as is', () => {
    expect(fmtDate('2021')).toBe('2021')
  })

  it('passes through unknown strings', () => {
    expect(fmtDate('sometime')).toBe('sometime')
  })

  it('handles empty input', () => {
    expect(fmtDate(undefined)).toBe('')
    expect(fmtDate('')).toBe('')
  })

  it('returns iso unchanged when format is iso', () => {
    expect(fmtDate('2021-07-01', 'iso')).toBe('2021-07-01')
  })
})

describe('dateRange', () => {
  it('joins start and end', () => {
    expect(dateRange('2021-07', '2023-01')).toBe('July 2021 - January 2023')
  })

  it('uses Present when no end', () => {
    expect(dateRange('2021-07')).toBe('July 2021 - Present')
  })

  it('returns undefined when both missing', () => {
    expect(dateRange(undefined, undefined)).toBeUndefined()
  })

  it('returns end only when no start', () => {
    expect(dateRange(undefined, '2021-07')).toBe('July 2021')
  })
})

describe('formatLocation', () => {
  it('joins city, region, country', () => {
    expect(
      formatLocation({ city: 'SF', region: 'CA', countryCode: 'US' }),
    ).toBe('SF, CA, US')
  })

  it('skips empty parts', () => {
    expect(formatLocation({ city: 'SF' })).toBe('SF')
  })

  it('returns empty for missing location', () => {
    expect(formatLocation(undefined)).toBe('')
  })
})

describe('renderProfiles', () => {
  it('renders username: url', () => {
    expect(
      renderProfiles([{ network: 'GitHub', username: 'jay', url: 'https://x' }]),
    ).toEqual(['jay: https://x'])
  })

  it('falls back to network name', () => {
    expect(
      renderProfiles([{ network: 'GitHub', url: 'https://x' }]),
    ).toEqual(['GitHub: https://x'])
  })

  it('handles no profiles', () => {
    expect(renderProfiles(undefined)).toEqual([])
  })
})

describe('filterEmpty', () => {
  it('drops empty items', () => {
    const items = [{ name: 'a' }, {}, { name: '' }]
    expect(filterEmpty(items)).toEqual([{ name: 'a' }])
  })
})

describe('bullets/csv/heading/joinSections', () => {
  it('bulletList prefixes items', () => {
    expect(bulletList(['a', 'b'])).toEqual(['  * a', '  * b'])
  })

  it('csvLine joins with commas', () => {
    expect(csvLine(['a', 'b'])).toBe('  a, b')
  })

  it('heading underlines with =', () => {
    expect(heading('WORK')).toBe('WORK\n====')
  })

  it('joinSections collapses blank runs', () => {
    expect(joinSections(['a', '', 'b'])).toBe('a\n\nb')
  })
})