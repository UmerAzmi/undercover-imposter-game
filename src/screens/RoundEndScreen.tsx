import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { useT } from '../i18n/LocaleProvider'
import { getCleanPlayerName } from '../lib/playerProfiles'
import type { SessionScore, Winner } from '../game/types'

type Props = {
  winner: Winner
  word: string
  imposterNames: string[]
  sessionScore?: SessionScore
  onPlayAgain: () => void
  onHome: () => void
}

export function RoundEndScreen({
  winner,
  word,
  imposterNames,
  sessionScore,
  onPlayAgain,
  onHome,
}: Props) {
  const t = useT()
  return (
    <Screen
      footer={
        <div className="space-y-2">
          <Button onClick={onPlayAgain}>{t('roundEnd.playAgain')}</Button>
          <Button variant="ghost" onClick={onHome}>{t('roundEnd.home')}</Button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-2">
        <div className="text-7xl" aria-hidden>{winner === 'crew' ? '🏆' : '🕵️'}</div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          {winner === 'crew' ? t('roundEnd.crewWins') : t('roundEnd.imposterWins')}
        </h1>
        <div className="bg-card border border-line rounded-2xl p-4 max-w-xs w-full">
          <p className="text-white/60 text-sm uppercase tracking-widest">{t('roundEnd.theWord')}</p>
          <p className="text-2xl font-bold mt-1 break-words">{word}</p>
        </div>
        {imposterNames.length > 0 && (
          <p className="text-white/60 max-w-xs text-sm">
            {t('roundEnd.imposterWas', { names: imposterNames.map((n) => getCleanPlayerName(n)).join(', ') })}
          </p>
        )}

        {sessionScore && sessionScore.roundsPlayed > 0 && (
          <div className="w-full max-w-xs bg-line/40 border border-line rounded-2xl p-3 flex items-center justify-around text-xs mt-1">
            <div className="text-center">
              <div className="text-white/50 text-[10px] uppercase font-semibold">{t('scoreboard.crew')}</div>
              <div className="text-lg font-bold text-success">{sessionScore.crewWins}</div>
            </div>
            <div className="text-white/20 text-xl font-light">|</div>
            <div className="text-center">
              <div className="text-white/50 text-[10px] uppercase font-semibold">{t('scoreboard.rounds')}</div>
              <div className="text-lg font-bold text-white/80">{sessionScore.roundsPlayed}</div>
            </div>
            <div className="text-white/20 text-xl font-light">|</div>
            <div className="text-center">
              <div className="text-white/50 text-[10px] uppercase font-semibold">{t('scoreboard.imposter')}</div>
              <div className="text-lg font-bold text-accent">{sessionScore.imposterWins}</div>
            </div>
          </div>
        )}
      </div>
    </Screen>
  )
}
