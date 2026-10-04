import { describe, expect, it } from 'vitest'
import { isVersionNewer, parseVersion } from './versionCompare'

describe('versionCompare', () => {
  it('parses tags with v prefix', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3])
  })

  it('detects newer remote versions', () => {
    expect(isVersionNewer('1.0.1', '1.0.0')).toBe(true)
    expect(isVersionNewer('1.1.0', '1.0.9')).toBe(true)
    expect(isVersionNewer('2.0.0', '1.9.9')).toBe(true)
    expect(isVersionNewer('1.0.0', '1.0.0')).toBe(false)
    expect(isVersionNewer('1.0.0', '1.0.1')).toBe(false)
  })
})
