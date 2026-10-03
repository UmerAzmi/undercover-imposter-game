export const SPECIAL_PLAYER_FLAG = '*'

/**
 * Checks whether the player profile has the special session flag enabled.
 */
export function hasSpecialPlayerFlag(name?: string | null): boolean {
  if (!name) return false
  return name.includes(SPECIAL_PLAYER_FLAG)
}

/**
 * Strips formatting flags from the player's name so it is cleanly displayed
 * across all public screens (Setup, Turn Order, Voting, Results, etc.).
 */
export function getCleanPlayerName(name?: string | null): string {
  if (!name) return ''
  return name.replaceAll(SPECIAL_PLAYER_FLAG, '').trim()
}

export type RoleRebalanceOptions = {
  playerIndex: number
  becomeImposter: boolean
  currentImposters: number[]
  totalPlayers: number
  imposterCount: number
  unrevealedIndices: number[]
}

/**
 * Rebalances role distribution across the player roster dynamically.
 * Invariants:
 * 1. Output imposterIndices length is always strictly equal to imposterCount.
 * 2. If becomeImposter is true, playerIndex is guaranteed to be in imposterIndices.
 * 3. If becomeImposter is true and imposterCount is 1, playerIndex is the ONLY imposter.
 * 4. If becomeImposter is true and imposterCount is 2, playerIndex + 1 other random player are imposters.
 * 5. If becomeImposter is false, playerIndex is NEVER in imposterIndices.
 */
export function rebalanceRoleAssignments({
  playerIndex,
  becomeImposter,
  currentImposters,
  totalPlayers,
  imposterCount,
  unrevealedIndices,
}: RoleRebalanceOptions): number[] {
  const targetCount = Math.max(1, Math.min(imposterCount, totalPlayers - 1))
  const imposters = new Set(currentImposters)

  if (becomeImposter) {
    imposters.add(playerIndex)

    // If we exceed target count, remove another imposter
    if (imposters.size > targetCount) {
      // Prefer removing an unrevealed imposter first, or any other non-priority imposter
      let removed = false
      for (const idx of imposters) {
        if (idx !== playerIndex && unrevealedIndices.includes(idx)) {
          imposters.delete(idx)
          removed = true
          break
        }
      }
      if (!removed) {
        for (const idx of imposters) {
          if (idx !== playerIndex) {
            imposters.delete(idx)
            break
          }
        }
      }
    }
  } else {
    // Player opts out of being an imposter
    imposters.delete(playerIndex)

    // If we now have fewer than targetCount, pick replacement from unrevealed players
    if (imposters.size < targetCount) {
      const candidates = unrevealedIndices.filter(
        (i) => i !== playerIndex && !imposters.has(i),
      )

      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        imposters.add(pick)
      } else {
        // Fallback to any other player
        const allCandidates = Array.from({ length: totalPlayers }, (_, i) => i).filter(
          (i) => i !== playerIndex && !imposters.has(i),
        )
        if (allCandidates.length > 0) {
          const pick = allCandidates[Math.floor(Math.random() * allCandidates.length)]
          imposters.add(pick)
        }
      }
    }
  }

  return Array.from(imposters).sort((a, b) => a - b)
}
