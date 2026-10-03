import type { ThemeColor } from '../game/types'

export type ThemeDef = {
  id: ThemeColor
  label: string
  hex: string
  rgb: string
}

export const THEMES: ThemeDef[] = [
  { id: 'crimson', label: 'Crimson', hex: '#f43f5e', rgb: '244 63 94' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981', rgb: '16 185 129' },
  { id: 'cyan', label: 'Cyan', hex: '#06b6d4', rgb: '6 182 212' },
  { id: 'violet', label: 'Violet', hex: '#8b5cf6', rgb: '139 92 246' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b', rgb: '245 158 11' },
]

const LEGACY_THEMES: Record<string, ThemeDef> = {
  rose: { id: 'rose', label: 'Rose', hex: '#ff5577', rgb: '255 85 119' },
  neon: { id: 'neon', label: 'Neon', hex: '#10b981', rgb: '16 185 129' },
  blue: { id: 'blue', label: 'Sky', hex: '#0ea5e9', rgb: '14 165 233' },
  purple: { id: 'purple', label: 'Violet', hex: '#a855f7', rgb: '168 85 247' },
}

export function applyTheme(theme: ThemeColor) {
  if (typeof document === 'undefined') return
  const found = THEMES.find((t) => t.id === theme) ?? LEGACY_THEMES[theme] ?? THEMES[0]
  document.documentElement.style.setProperty('--color-accent-rgb', found.rgb)
  document.documentElement.style.setProperty('--color-accent', found.hex)
}

