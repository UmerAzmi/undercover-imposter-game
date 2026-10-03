export type PlayerColor = {
  id: string
  name: string
  hex: string
  rgb: string
}

export const PLAYER_COLORS: PlayerColor[] = [
  { id: 'crimson', name: 'Ruby', hex: '#f43f5e', rgb: '244 63 94' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b', rgb: '245 158 11' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981', rgb: '16 185 129' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4', rgb: '6 182 212' },
  { id: 'blue', name: 'Sapphire', hex: '#3b82f6', rgb: '59 130 246' },
  { id: 'violet', name: 'Violet', hex: '#8b5cf6', rgb: '139 92 246' },
  { id: 'magenta', name: 'Magenta', hex: '#d946ef', rgb: '217 70 239' },
  { id: 'orange', name: 'Coral', hex: '#f97316', rgb: '249 115 22' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6', rgb: '20 184 166' },
  { id: 'lime', name: 'Lime', hex: '#84cc16', rgb: '132 204 22' },
  { id: 'indigo', name: 'Indigo', hex: '#6366f1', rgb: '99 102 241' },
  { id: 'rose', name: 'Rose', hex: '#fb7185', rgb: '251 113 133' },
]

export function getPlayerColor(colorOrName?: string, fallbackIndex = 0): string {
  if (!colorOrName) {
    return PLAYER_COLORS[Math.abs(fallbackIndex) % PLAYER_COLORS.length].hex
  }
  const byId = PLAYER_COLORS.find((c) => c.id.toLowerCase() === colorOrName.toLowerCase())
  if (byId) return byId.hex

  const byHex = PLAYER_COLORS.find((c) => c.hex.toLowerCase() === colorOrName.toLowerCase())
  if (byHex) return byHex.hex

  // If it's already a valid hex color, return as is
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorOrName)) {
    return colorOrName
  }

  return PLAYER_COLORS[Math.abs(fallbackIndex) % PLAYER_COLORS.length].hex
}
