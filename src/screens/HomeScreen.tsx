import type { ReactNode } from 'react'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { useT } from '../i18n/LocaleProvider'
import type { SessionScore } from '../game/types'

type Props = {
  onStart: () => void
  onOpenSettings: () => void
  /** Optional banner rendered above the Play button (e.g. install prompt). */
  banner?: ReactNode
  sessionScore?: SessionScore
  onResetScore?: () => void
}

export function HomeScreen({ onStart, onOpenSettings, banner, sessionScore, onResetScore }: Props) {
  const t = useT()
  const hasScores = sessionScore && sessionScore.roundsPlayed > 0

  return (
    <Screen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 sm:gap-5 py-2">
        <div className="relative group">
          <div
            className="absolute -inset-2 rounded-3xl bg-accent/25 blur-xl opacity-75 group-hover:opacity-100 transition duration-500"
            aria-hidden
          />
          <img
            src="/icon-192.png"
            alt="Undercover: The Imposter Game Logo"
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-2xl border border-white/10 object-cover"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">{t('home.title')}</h1>
          <p className="text-xs uppercase tracking-widest text-accent font-bold">The Imposter Game</p>
        </div>
        <p className="text-white/70 max-w-xs text-sm sm:text-base">{t('home.subtitle')}</p>

        {hasScores && (
          <div className="mt-1 w-full max-w-xs bg-card border border-line rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex flex-col text-left">
              <span className="text-white/50 uppercase tracking-wider font-semibold text-[10px]">
                {t('scoreboard.title')} ({sessionScore.roundsPlayed})
              </span>
              <div className="flex items-center gap-2 mt-0.5 font-bold text-sm">
                <span className="text-success">{t('scoreboard.crew')}: {sessionScore.crewWins}</span>
                <span className="text-white/30">·</span>
                <span className="text-accent">{t('scoreboard.imposter')}: {sessionScore.imposterWins}</span>
              </div>
            </div>
            {onResetScore && (
              <button
                type="button"
                onClick={onResetScore}
                className="text-white/40 hover:text-white text-xs underline underline-offset-2 ml-2"
              >
                {t('scoreboard.reset')}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 pb-safe">
        {banner}
        <Button onClick={onStart}>{t('home.start')}</Button>
        <Button variant="ghost" onClick={onOpenSettings}>{t('home.settingsLink')}</Button>
      </div>
    </Screen>
  )
}
