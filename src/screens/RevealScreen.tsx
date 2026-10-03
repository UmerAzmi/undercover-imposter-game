import { useState } from 'react'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { ExitRoundButton } from '../components/ExitRoundButton'
import { HoldToReveal } from '../components/HoldToReveal'
import { useT } from '../i18n/LocaleProvider'
import { getPlayerColor } from '../lib/playerColors'

type Props = {
  playerName: string
  playerColor?: string
  isImposter: boolean
  word: string
  hint: string
  hintsEnabled: boolean
  onContinue: () => void
  onAbort: () => void
}

export function RevealScreen({
  playerName,
  playerColor,
  isImposter,
  word,
  hint,
  hintsEnabled,
  onContinue,
  onAbort,
}: Props) {
  const t = useT()
  const [seen, setSeen] = useState(false)
  const color = getPlayerColor(playerColor)
  const fillColor = isImposter ? '#f43f5e' : '#10b981'

  return (
    <Screen
      footer={
        <Button onClick={onContinue} disabled={!seen}>
          {t('reveal.continue')}
        </Button>
      }
    >
      <ExitRoundButton onConfirm={onAbort} />

      <div className="text-center pt-2 pb-3">
        {/* Subtle Player Color Tag */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border shadow-sm mb-1.5"
          style={{
            borderColor: `${color}50`,
            backgroundColor: `${color}15`,
            color: '#ffffff',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
          <span>{playerName}</span>
        </div>
        <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold">
          Hold to inspect your assignment
        </p>
      </div>

      <HoldToReveal
        prompt={t('reveal.holdPrompt')}
        fillColor={fillColor}
        onFullyRevealed={() => setSeen(true)}
      >
        {isImposter ? (
          <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/40 shadow-[0_0_35px_rgba(244,63,94,0.3)] space-y-3">
            <div className="text-5xl select-none" aria-hidden>🕵️</div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-black uppercase tracking-wider">
              Undercover Imposter
            </div>
            <div className="text-3xl sm:text-4xl font-black text-red-500 tracking-tight">
              {t('reveal.imposter')}
            </div>
            <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              You do not know the word. Listen closely, bluff your clue, and avoid detection!
            </p>
            {hintsEnabled && hint && (
              <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-red-500/20 text-white/90 text-xs">
                <span className="text-red-400 font-semibold">{t('reveal.hintLabel')}: </span>
                <span className="font-bold">{hint}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.3)] space-y-3">
            <div className="text-5xl select-none" aria-hidden>🛡️</div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
              Innocent Crew
            </div>
            <div className="text-[11px] text-white/60 uppercase tracking-widest font-semibold">
              {t('reveal.theWord')}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight break-words drop-shadow">
              {word}
            </div>
            <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              Give a clever clue on your turn to prove your innocence to fellow crew members!
            </p>
          </div>
        )}
      </HoldToReveal>

      <p className="text-white/40 text-xs text-center pt-3">
        {t('reveal.holdHint')}
      </p>
    </Screen>
  )
}
