import type { ThemeColor } from '../game/types'

export type ThemeDef = {
  id: ThemeColor
  label: string
  hex: string
  rgb: string
}

export const THEMES: ThemeDef[] = [
  { id: 'rose', label: 'Rose', hex: '#ff5577', rgb: '255 85 119' },
  { id: 'neon', label: 'Neon', hex: '#10b981', rgb: '16 185 129' },
  { id: 'blue', label: 'Sky', hex: '#0ea5e9', rgb: '14 165 233' },
  { id: 'purple', label: 'Violet', hex: '#a855f7', rgb: '168 85 247' },
  { id: 'amber', label: 'Sunset', hex: '#f97316', rgb: '249 115 22' },
]

export function applyTheme(theme: ThemeColor) {
  if (typeof document === 'undefined') return
  const found = THEMES.find((t) => t.id === theme) ?? THEMES[0]
  document.documentElement.style.setProperty('--color-accent-rgb', found.rgb)
  document.documentElement.style.setProperty('--color-accent', found.hex)
}
