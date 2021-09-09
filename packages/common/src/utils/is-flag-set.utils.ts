/**
 * Tests the `input` against a series
 * of bits - `flags`.
 *
 * Returns `true` if one bit flag is matched:
 * ```
 * // flags: 010101
 * // input: 010000
 * true
 * ```
 * ```
 * // flags: 010101
 * // input: 010110
 * false
 * ```
 */
export function isFlagSet(input: number, flags: number) {
  const flagMatches = input & flags;
  const isOnlySingleBitMatched = (flagMatches & (flagMatches - 1)) === 0;
  return isOnlySingleBitMatched;
}
