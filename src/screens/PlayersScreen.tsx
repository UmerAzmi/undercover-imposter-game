import { useState } from 'react'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { ScreenHeader } from '../components/ScreenHeader'
import { ScrollArea } from '../components/ScrollArea'
import { useT } from '../i18n/LocaleProvider'
import { todayISO } from '../game/persistence'
import { PLAYER_COLORS, getPlayerColor } from '../lib/playerColors'
import { getCleanPlayerName, SPECIAL_PLAYER_FLAG } from '../lib/playerProfiles'

type Props = {
  players: string[]
  playerColors?: Record<string, string>
  onSetPlayerColor?: (name: string, color: string) => void
  /** ISO date of the previous round, used to flag a stale list. */
  lastPlayed: string | null
  onAdd: (name: string, color?: string) => void
  onRemove: (index: number) => void
  onContinue: () => void
  onBack: () => void
  /** Which translation key drives the footer button label. */
  continueLabel: 'continue' | 'done'
}

const MIN_PLAYERS = 3

export function PlayersScreen({
  players,
  playerColors = {},
  onSetPlayerColor,
  lastPlayed,
  onAdd,
  onRemove,
  onContinue,
  onBack,
  continueLabel,
}: Props) {
  const t = useT()
  const [name, setName] = useState('')
  const [hasFlagPending, setHasFlagPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw.includes(SPECIAL_PLAYER_FLAG)) {
      setHasFlagPending(true)
      // Strip flag immediately so it is never displayed in the input field
      setName(raw.replaceAll(SPECIAL_PLAYER_FLAG, ''))
    } else {
      setName(raw)
    }
    if (error) setError(null)
  }

  const submit = () => {
    const clean = name.trim()
    if (!clean) return

    // Store internal marker if user enabled the tag, while keeping display clean
    const nameToStore = hasFlagPending ? `${clean}${SPECIAL_PLAYER_FLAG}` : clean

    if (players.some((p) => getCleanPlayerName(p).toLowerCase() === clean.toLowerCase())) {
      setError(t('players.duplicate'))
      return
    }
    setError(null)
    // Find next unassigned color from palette
    const usedColors = new Set(players.map((p, idx) => playerColors[p] ?? getPlayerColor(undefined, idx)))
    const unused = PLAYER_COLORS.find((c) => !usedColors.has(c.hex)) ?? PLAYER_COLORS[players.length % PLAYER_COLORS.length]
    onAdd(nameToStore, unused.hex)
    setName('')
    setHasFlagPending(false)
  }

  const canContinue = players.length >= MIN_PLAYERS
  const today = todayISO()
  const isStale =
    lastPlayed !== null && lastPlayed !== today && players.length >= MIN_PLAYERS

  return (
    <Screen
      footer={
        <Button onClick={onContinue} disabled={!canContinue}>
          <span className="flex items-center justify-between w-full">
            <span>{t(continueLabel === 'done' ? 'players.done' : 'players.continue')}</span>
            <span className="text-sm font-semibold opacity-80">
              {t('players.countSuffix', { count: players.length })}
            </span>
          </span>
        </Button>
      }
    >
      <ScreenHeader title={t('players.title')} onBack={onBack} />

      {isStale && (
        <div className="bg-card border border-line rounded-2xl px-4 py-3 mb-3">
          <p className="text-sm text-white/80 leading-snug">
            {t('players.staleHint', { date: lastPlayed })}
          </p>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0" contentClassName="pb-2 pr-2 space-y-2">
        {players.map((p, i) => {
          const color = playerColors[p] ?? getPlayerColor(undefined, i)
          const isPickerOpen = activePickerIndex === i

          return (
            <div key={p} className="flex flex-col bg-card border border-line rounded-2xl p-2.5 transition-all">
              <div className="flex items-center">
                {/* Interactive Player Color Swatch */}
                <button
                  type="button"
                  onClick={() => setActivePickerIndex(isPickerOpen ? null : i)}
                  className="w-8 h-8 rounded-full border-2 border-white/20 mr-3 shrink-0 press-ios shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                  title="Choose color"
                  aria-label={`Change color for ${getCleanPlayerName(p)}`}
                />
                <span className="flex-1 font-semibold truncate text-white">{getCleanPlayerName(p)}</span>
                <button
                  onClick={() => {
                    if (activePickerIndex === i) setActivePickerIndex(null)
                    onRemove(i)
                  }}
                  className="text-white/50 hover:text-white text-xl px-2.5 py-1"
                  aria-label={t('players.remove')}
                >
                  ✕
                </button>
              </div>

              {/* Color Picker Drawer */}
              {isPickerOpen && (
                <div className="pt-2.5 mt-2 border-t border-line/60">
                  <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">
                    Pick a Color
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {PLAYER_COLORS.map((c) => {
                      const isSelected = color.toLowerCase() === c.hex.toLowerCase()
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            onSetPlayerColor?.(p, c.hex)
                            setActivePickerIndex(null)
                          }}
                          className={`h-7 rounded-xl border transition-all flex items-center justify-center ${
                            isSelected
                              ? 'scale-110 border-white ring-2 ring-white/50'
                              : 'border-white/20 hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="mt-2"
        >
          <div className="flex items-center gap-2">
            <input
              name="playerName"
              value={name}
              onChange={handleNameChange}
              placeholder={t('players.placeholder')}
              className={
                `flex-1 bg-card border rounded-2xl px-4 h-12 text-white placeholder:text-white/40 outline-none ` +
                (error ? 'border-danger focus:border-danger' : 'border-line focus:border-white/40')
              }
              maxLength={20}
              autoCapitalize="words"
              autoCorrect="off"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-12 w-12 rounded-full bg-card border border-line text-2xl active:bg-line disabled:opacity-40 flex items-center justify-center"
              aria-label={t('players.add')}
            >
              +
            </button>
          </div>
          {error && (
            <p className="text-danger text-xs px-3 pt-1.5 font-medium animate-pulse">
              {error}
            </p>
          )}
        </form>

        {!canContinue && (
          <p className="text-white/50 text-sm text-center pt-4">
            {t('players.minHint', { min: MIN_PLAYERS })}
          </p>
        )}
      </ScrollArea>
    </Screen>
  )
}
