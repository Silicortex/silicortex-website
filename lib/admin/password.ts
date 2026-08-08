import { createHash, timingSafeEqual } from 'node:crypto'

// Compares via fixed-length SHA-256 digests: timingSafeEqual throws on
// length mismatch, and comparing raw strings with === leaks length and
// matching prefix through timing.
export function passwordsMatch(input: string, expected: string): boolean {
  if (!expected) return false
  const a = createHash('sha256').update(input, 'utf8').digest()
  const b = createHash('sha256').update(expected, 'utf8').digest()
  return timingSafeEqual(a, b)
}
