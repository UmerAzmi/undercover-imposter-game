import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { ExitRoundButton } from '../components/ExitRoundButton'
import { useT } from '../i18n/LocaleProvider'
import { getPlayerColor } from '../lib/playerColors'
import { getCleanPlayerName } from '../lib/playerProfiles'

type Props = {
  name: string
  index: number
  total: number
  variant: 'reveal' | 'vote'
  playerColor?: string
  onContinue: () => void
  onAbort: () => void
}

export function HandoffScreen({
  name,
  index,
  total,
  variant,
  playerColor,
  onContinue,
  onAbort,
}: Props) {
  const t = useT()
  const subtitle = variant === 'reveal' ? t('handoff.reveal.subtitle') : t('handoff.vote.subtitle')
  const tap = variant === 'reveal' ? t('handoff.reveal.tap') : t('handoff.vote.tap')
  const color = getPlayerColor(playerColor, index)

  return (
    <Screen footer={<Button onClick={onContinue}>{tap}</Button>}>
      <ExitRoundButton onConfirm={onAbort} />

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4 relative">
        {/* Subtle ambient backlight glow matching player's chosen color */}
        <div
          className="absolute w-52 h-52 rounded-full blur-[90px] pointer-events-none opacity-25 -z-0"
          style={{ backgroundColor: color }}
          aria-hidden
        />

        <div className="relative z-10 space-y-4 max-w-sm">
          <div className="text-6xl select-none" aria-hidden>📱</div>

          <div className="space-y-2">
            <p className="text-white/60 uppercase tracking-widest text-xs font-semibold">
              {t('handoff.passTo')}
            </p>

            {/* Player Identity Tag with Chosen Color */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-sm font-bold border shadow-md"
              style={{
                borderColor: `${color}50`,
                backgroundColor: `${color}18`,
                color: '#ffffff',
              }}
            >
              <span
                className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white/20"
                style={{ backgroundColor: color }}
              />
              <span className="text-xl font-extrabold tracking-tight">{getCleanPlayerName(name)}</span>
            </div>
          </div>

          <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
            {subtitle}
          </p>

          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider pt-2">
            {t('handoff.progress', { current: index + 1, total })}
          </p>
        </div>
      </div>
    </Screen>
  )
}
