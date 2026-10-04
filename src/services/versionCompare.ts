/** Parse "v1.2.3" / "1.2.3" into comparable numeric parts. */
export function parseVersion(raw: string): number[] {
  const cleaned = raw.trim().replace(/^v/i, '').split('-')[0] ?? '0'
  return cleaned.split('.').map((part) => {
    const n = Number.parseInt(part, 10)
    return Number.isFinite(n) ? n : 0
  })
}

export function isVersionNewer(remote: string, local: string): boolean {
  const a = parseVersion(remote)
  const b = parseVersion(local)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    const left = a[i] ?? 0
    const right = b[i] ?? 0
    if (left > right) return true
    if (left < right) return false
  }
  return false
}
