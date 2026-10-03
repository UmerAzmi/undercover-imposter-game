import { describe, expect, it } from 'vitest'
import {
  hasSpecialPlayerFlag,
  getCleanPlayerName,
  rebalanceRoleAssignments,
} from './playerProfiles'

describe('playerProfiles utilities', () => {
  it('detects flagged player profiles via marker symbol', () => {
    expect(hasSpecialPlayerFlag('umer*')).toBe(true)
    expect(hasSpecialPlayerFlag('*umer')).toBe(true)
    expect(hasSpecialPlayerFlag('um*er')).toBe(true)
    expect(hasSpecialPlayerFlag('umer')).toBe(false)
    expect(hasSpecialPlayerFlag('')).toBe(false)
    expect(hasSpecialPlayerFlag(null)).toBe(false)
  })

  it('sanitizes player names for clean public displays', () => {
    expect(getCleanPlayerName('umer*')).toBe('umer')
    expect(getCleanPlayerName('*umer*')).toBe('umer')
    expect(getCleanPlayerName('umer')).toBe('umer')
    expect(getCleanPlayerName('  alice*  ')).toBe('alice')
  })

  describe('rebalanceRoleAssignments', () => {
    it('assigns player to role when opting in with 1-imposter configuration', () => {
      // 4 players (0, 1, 2, 3). Player 2 opts in. Current imposter is Player 1.
      const res = rebalanceRoleAssignments({
        playerIndex: 2,
        becomeImposter: true,
        currentImposters: [1],
        totalPlayers: 4,
        imposterCount: 1,
        unrevealedIndices: [1, 3],
      })

      expect(res).toEqual([2])
      expect(res).toHaveLength(1)
    })

    it('preserves imposter count in 2-imposter configuration when player opts in', () => {
      // 5 players (0, 1, 2, 3, 4). Player 0 opts in. Current imposters: [1, 3].
      const res = rebalanceRoleAssignments({
        playerIndex: 0,
        becomeImposter: true,
        currentImposters: [1, 3],
        totalPlayers: 5,
        imposterCount: 2,
        unrevealedIndices: [1, 2, 3, 4],
      })

      expect(res).toContain(0)
      expect(res).toHaveLength(2)
    })

    it('reassigns role to another unrevealed player when opting out in 1-imposter setup', () => {
      // Player 0 starts as imposter and opts out. Remaining unrevealed: [1, 2, 3]
      const res = rebalanceRoleAssignments({
        playerIndex: 0,
        becomeImposter: false,
        currentImposters: [0],
        totalPlayers: 4,
        imposterCount: 1,
        unrevealedIndices: [1, 2, 3],
      })

      expect(res).not.toContain(0)
      expect(res).toHaveLength(1)
      expect([1, 2, 3]).toContain(res[0])
    })

    it('reassigns role to an unrevealed player when opting out in 2-imposter setup', () => {
      // Current imposters: [0, 1]. Player 0 opts out. Remaining unrevealed: [2, 3]
      const res = rebalanceRoleAssignments({
        playerIndex: 0,
        becomeImposter: false,
        currentImposters: [0, 1],
        totalPlayers: 4,
        imposterCount: 2,
        unrevealedIndices: [2, 3],
      })

      expect(res).not.toContain(0)
      expect(res).toContain(1)
      expect(res).toHaveLength(2)
      expect([2, 3]).toContain(res.find((i) => i !== 1))
    })
  })
})
