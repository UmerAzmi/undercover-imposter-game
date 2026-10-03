import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useInstallPrompt } from './lib/useInstallPrompt'
import { LocaleProvider, useLocale } from './i18n/LocaleProvider'
import { arePlayersStale, initialState, reducer } from './game/machine'
import type { Action } from './game/machine'
import {
  loadCustomCategories,
  loadPlayerColors,
  loadSessionScore,
  recordRoundWin,
  resetSessionScore,
  saveCategories,
  saveCustomCategories,
  savePlayerColors,
  savePlayers,
  saveSettings,
} from './game/persistence'
import type { CategoryWord, CustomCategory, SessionScore } from './game/types'
import { withTransition } from './lib/navigate'
import { applyTheme } from './lib/theme'
import { Button } from './components/Button'
import { InstallToast } from './components/InstallToast'
import { HomeScreen } from './screens/HomeScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { CategoriesScreen } from './screens/CategoriesScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { HandoffScreen } from './screens/HandoffScreen'
import { RevealScreen } from './screens/RevealScreen'
import { PlayScreen } from './screens/PlayScreen'
import { VoteScreen } from './screens/VoteScreen'
import { GroupVoteScreen } from './screens/GroupVoteScreen'
import { ResultScreen } from './screens/ResultScreen'
import { ImposterGuessScreen } from './screens/ImposterGuessScreen'
import { RoundEndScreen } from './screens/RoundEndScreen'

function Game() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const { bundle, loadError } = useLocale()
  const install = useInstallPrompt()
  const [showInstallToast, setShowInstallToast] = useState(true)

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => loadCustomCategories())
  const [sessionScore, setSessionScore] = useState<SessionScore>(() => loadSessionScore())
  const [playerColors, setPlayerColors] = useState<Record<string, string>>(() => loadPlayerColors())
  const recordedRoundRef = useRef<unknown>(null)

  useEffect(() => savePlayers(state.players), [state.players])
  useEffect(() => saveCategories(state.selectedCategoryIds), [state.selectedCategoryIds])
  useEffect(() => saveSettings(state.settings), [state.settings])
  useEffect(() => applyTheme(state.settings.theme), [state.settings.theme])
  useEffect(() => saveCustomCategories(customCategories), [customCategories])
  useEffect(() => savePlayerColors(playerColors), [playerColors])

  // Temporarily illuminate accent scrollbars during scrolling activity
  useEffect(() => {
    let timer: number | null = null
    const handleScroll = (e: Event) => {
      const el = e.target as HTMLElement | null
      if (el?.classList?.contains('scroll-smooth-y')) {
        el.classList.add('is-scrolling')
        if (timer) window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          el.classList.remove('is-scrolling')
        }, 800)
      }
    }
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  const handleSetPlayerColor = useCallback((name: string, color: string) => {
    setPlayerColors((prev) => ({ ...prev, [name]: color }))
  }, [])

  // Track session score wins
  useEffect(() => {
    if (state.phase === 'roundEnd' && state.winner && state.round && recordedRoundRef.current !== state.round) {
      recordedRoundRef.current = state.round
      const updated = recordRoundWin(state.winner)
      setSessionScore(updated)
    }
  }, [state.phase, state.winner, state.round])

  const handleResetScore = useCallback(() => {
    const reset = resetSessionScore()
    setSessionScore(reset)
  }, [])

  const handleAddCustomCategory = useCallback((cat: CustomCategory) => {
    setCustomCategories((prev) => [...prev, cat])
    dispatch({ type: 'toggleCategory', id: cat.id })
  }, [])

  const handleDeleteCustomCategory = useCallback((id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id))
    // Also deselect if currently selected
    dispatch({ type: 'toggleCategory', id })
  }, [])

  // Merge built-in locale words with user custom categories
  const allWords = useMemo(() => {
    const dict: Record<string, CategoryWord[]> = { ...(bundle?.words ?? {}) }
    for (const cat of customCategories) {
      dict[cat.id] = cat.words
    }
    return dict
  }, [bundle?.words, customCategories])

  // Phase changes go through View Transitions so the screen swap animates.
  // In-place updates (toggling a category, editing a setting) skip this.
  const navigate = useCallback(
    (action: Action, direction: 'forward' | 'back' = 'forward') => {
      withTransition(direction, () => dispatch(action))
    },
    [],
  )

  if (loadError) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 bg-ink text-white/80 px-6 text-center">
        <div className="text-5xl" aria-hidden>⚠️</div>
        <p className="text-lg font-semibold">Could not load language pack.</p>
        <div className="mt-2 w-full max-w-xs">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-ink text-white/50">
        …
      </div>
    )
  }

  switch (state.phase) {
    case 'home':
      return (
        <HomeScreen
          onStart={() => {
            // Skip the player-edit step on same-day replays — names from earlier
            // today almost certainly still apply. On a new day or with too few
            // players we route through the players screen so the host can confirm.
            if (arePlayersStale(state)) {
              navigate({ type: 'openPlayers', origin: 'home' })
            } else {
              navigate({ type: 'goto', phase: 'categories' })
            }
          }}
          onOpenSettings={() => navigate({ type: 'openSettings', origin: 'home' })}
          sessionScore={sessionScore}
          onResetScore={handleResetScore}
          banner={
            install.canInstall && showInstallToast ? (
              <InstallToast
                isIOS={install.isIOS}
                onInstall={async () => {
                  const outcome = await install.promptInstall()
                  if (outcome !== 'unavailable') setShowInstallToast(false)
                }}
                onDismiss={() => setShowInstallToast(false)}
              />
            ) : undefined
          }
        />
      )

    case 'players': {
      const fromSettings = state.playersOrigin === 'settings'
      return (
        <PlayersScreen
          players={state.players}
          playerColors={playerColors}
          onSetPlayerColor={handleSetPlayerColor}
          lastPlayed={state.lastPlayed}
          onAdd={(name, color) => {
            dispatch({ type: 'addPlayer', name })
            if (color) handleSetPlayerColor(name, color)
          }}
          onRemove={(i) => dispatch({ type: 'removePlayer', index: i })}
          onContinue={() =>
            navigate({ type: 'goto', phase: fromSettings ? 'settings' : 'categories' }, fromSettings ? 'back' : 'forward')
          }
          onBack={() =>
            navigate({ type: 'goto', phase: fromSettings ? 'settings' : 'home' }, 'back')
          }
          continueLabel={fromSettings ? 'done' : 'continue'}
        />
      )
    }

    case 'categories':
      return (
        <CategoriesScreen
          selected={state.selectedCategoryIds}
          customCategories={customCategories}
          onToggle={(id) => dispatch({ type: 'toggleCategory', id })}
          onAddCustomCategory={handleAddCustomCategory}
          onDeleteCustomCategory={handleDeleteCustomCategory}
          onContinue={() => navigate({ type: 'openSettings', origin: 'categories' })}
          onBack={() => navigate({ type: 'goto', phase: 'home' }, 'back')}
        />
      )

    case 'settings': {
      const fromHome = state.settingsOrigin === 'home'
      return (
        <SettingsScreen
          settings={state.settings}
          players={state.players}
          playerColors={playerColors}
          categoryCount={state.selectedCategoryIds.length}
          install={install}
          origin={state.settingsOrigin}
          onChange={(s) => dispatch({ type: 'setSettings', settings: s })}
          onEditPlayers={() => navigate({ type: 'openPlayers', origin: 'settings' })}
          onBack={() => navigate({ type: 'goto', phase: fromHome ? 'home' : 'categories' }, 'back')}
          onStart={() => navigate({ type: 'startRound', words: allWords })}
        />
      )
    }

    case 'handoff': {
      if (!state.round) return null
      const revealOrder = state.round.revealOrder ?? state.players.map((_, idx) => idx)
      const playerIndex = revealOrder[state.cursor]
      const rawName = state.players[playerIndex]
      return (
        <HandoffScreen
          name={rawName}
          playerColor={playerColors[rawName]}
          index={state.cursor}
          total={state.players.length}
          variant="reveal"
          onContinue={() => navigate({ type: 'goto', phase: 'reveal' })}
          onAbort={() => navigate({ type: 'abortRound' }, 'back')}
        />
      )
    }

    case 'reveal': {
      if (!state.round) return null
      const revealOrder = state.round.revealOrder ?? state.players.map((_, idx) => idx)
      const playerIndex = revealOrder[state.cursor]
      const rawName = state.players[playerIndex]
      const isImposter = state.round.imposterIndices.includes(playerIndex)
      return (
        <RevealScreen
          playerName={rawName}
          playerColor={playerColors[rawName]}
          isImposter={isImposter}
          word={state.round.word}
          hint={state.round.hint}
          hintsEnabled={state.settings.hintsEnabled}
          onContinue={() => navigate({ type: 'advanceReveal' })}
          onAbort={() => navigate({ type: 'abortRound' }, 'back')}
          onUpdateRoleAssignment={(becomeImposter) =>
            dispatch({ type: 'updateRoleAssignment', playerIndex, becomeImposter })
          }
        />
      )
    }

    case 'play': {
      if (!state.round) return null
      const activeCustom = customCategories.find((c) => c.id === state.round?.categoryId)
      const starterName = state.players[state.round.starterIndex]
      return (
        <PlayScreen
          categoryId={state.round.categoryId}
          categoryName={activeCustom?.name}
          categoryEmoji={activeCustom?.emoji}
          starterName={starterName}
          starterColor={playerColors[starterName]}
          onFinish={() => navigate({ type: 'finishPlay' })}
          onAbort={() => navigate({ type: 'abortRound' }, 'back')}
        />
      )
    }

    case 'voteHandoff': {
      if (!state.round) return null
      const i = state.cursor
      return (
        <HandoffScreen
          name={state.players[i]}
          playerColor={playerColors[state.players[i]]}
          index={i}
          total={state.players.length}
          variant="vote"
          onContinue={() => navigate({ type: 'goto', phase: 'vote' })}
          onAbort={() => navigate({ type: 'abortRound' }, 'back')}
        />
      )
    }

    case 'vote': {
      if (!state.round) return null
      if (state.settings.voteMode === 'group') {
        return (
          <GroupVoteScreen
            players={state.players}
            onConfirm={(target) => navigate({ type: 'castGroupVote', target })}
          />
        )
      }
      const i = state.cursor
      const candidates = state.round.tieRevoteAmong ?? state.players.map((_, idx) => idx)
      return (
        <VoteScreen
          voterName={state.players[i]}
          voterIndex={i}
          players={state.players}
          candidateIndices={candidates}
          onConfirm={(target) => navigate({ type: 'castVote', voter: i, target })}
        />
      )
    }

    case 'result': {
      if (!state.round || !state.resultMostVoted || state.resultMostVoted.length === 0) {
        // Edge case: nobody got a vote (shouldn't happen — every voter must select).
        // Fall back to round-end with imposter as winner.
        if (state.round) {
          const imposterNames = state.round.imposterIndices.map((idx) => state.players[idx])
          return (
            <RoundEndScreen
              winner={state.winner ?? 'imposter'}
              word={state.round.word}
              imposterNames={imposterNames}
              sessionScore={sessionScore}
              onPlayAgain={() => navigate({ type: 'startRound', words: allWords })}
              onHome={() => navigate({ type: 'reset' }, 'back')}
            />
          )
        }
        return null
      }
      const eliminated = state.resultMostVoted[0]
      const wasImposter = state.round.imposterIndices.includes(eliminated)
      const imposterNames = state.round.imposterIndices.map((idx) => state.players[idx])
      return (
        <ResultScreen
          eliminatedName={state.players[eliminated]}
          imposterNames={imposterNames}
          wasImposter={wasImposter}
          onContinue={() => {
            if (wasImposter) {
              navigate({ type: 'goto', phase: 'imposterGuess' })
            } else {
              navigate({ type: 'goto', phase: 'roundEnd' })
            }
          }}
        />
      )
    }

    case 'imposterGuess': {
      if (!state.round || !state.resultMostVoted || state.resultMostVoted.length === 0) return null
      const eliminated = state.resultMostVoted[0]
      return (
        <ImposterGuessScreen
          imposterName={state.players[eliminated]}
          words={state.round.categoryWords}
          onGuess={(word) => navigate({ type: 'imposterGuess', word })}
        />
      )
    }

    case 'roundEnd': {
      if (!state.round || !state.winner) return null
      const imposterNames = state.round.imposterIndices.map((idx) => state.players[idx])
      return (
        <RoundEndScreen
          winner={state.winner}
          word={state.round.word}
          imposterNames={imposterNames}
          sessionScore={sessionScore}
          onPlayAgain={() => navigate({ type: 'startRound', words: allWords })}
          onHome={() => navigate({ type: 'reset' }, 'back')}
        />
      )
    }

    default:
      return <div className="p-6">Unknown phase: {state.phase}</div>
  }
}

export default function App() {
  return (
    <LocaleProvider>
      <div className="min-h-dvh sm:h-dvh w-full flex items-center justify-center bg-[#05070a] p-0 sm:p-4 md:p-6 overflow-hidden relative select-none">
        {/* Ambient desktop stealth glow */}
        <div
          className="hidden sm:block absolute w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-20 -z-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
          aria-hidden
        />

        {/* Device frame on desktop / edge-to-edge native on mobile */}
        <div className="w-full h-dvh sm:h-[840px] sm:max-h-[92dvh] sm:max-w-[420px] md:max-w-[440px] bg-ink text-white sm:rounded-[40px] sm:border sm:border-line sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(var(--color-accent-rgb),0.07)] sm:overflow-hidden relative flex flex-col z-10">
          {/* Subtle phone notch on desktop */}
          <div className="hidden sm:flex items-center justify-center pt-2.5 pb-1 select-none pointer-events-none shrink-0" aria-hidden>
            <div className="w-14 h-1 rounded-full bg-white/20" />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative app-viewport">
            <Game />
          </div>
        </div>
      </div>
    </LocaleProvider>
  )
}
