import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { ExitRoundButton } from '../components/ExitRoundButton'
import { ScrollArea } from '../components/ScrollArea'
import { useLocale } from '../i18n/LocaleProvider'
import { getPlayerColor } from '../lib/playerColors'
import { getCleanPlayerName } from '../lib/playerProfiles'

type Props = {
  categoryId: string
  categoryName?: string
  categoryEmoji?: string
  starterName: string
  starterColor?: string
  onFinish: () => void
  onAbort: () => void
}

export function PlayScreen({
  categoryId,
  categoryName,
  categoryEmoji,
  starterName,
  starterColor,
  onFinish,
  onAbort,
}: Props) {
  const { bundle } = useLocale()
  const meta = bundle?.categories[categoryId]
  const color = getPlayerColor(starterColor)
  const cleanStarterName = getCleanPlayerName(starterName)

  return (
    <Screen
      footer={
        <Button onClick={onFinish}>
          Proceed to Vote
        </Button>
      }
    >
      <ExitRoundButton onConfirm={onAbort} />

      {/* Screen Title & Category */}
      <div className="text-center pt-2 pb-1 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-line/60 border border-white/10 text-xs font-semibold text-white/80">
          <span className="text-base select-none" aria-hidden>
            {categoryEmoji ?? meta?.emoji ?? '❓'}
          </span>
          <span>{categoryName ?? meta?.name ?? categoryId}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0" contentClassName="space-y-3.5 py-2 pr-2">
        {/* Hero Card: Random Starter Player */}
        <div className="relative rounded-3xl bg-card border border-line p-5 text-center shadow-xl overflow-hidden">
          {/* Ambient player color glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[70px] pointer-events-none opacity-20 -z-0"
            style={{ backgroundColor: color }}
            aria-hidden
          />

          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-accent">
              First Speaker
            </span>

            {/* Glowing Starter Ring */}
            <div className="flex justify-center my-1">
              <div
                className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg text-2xl font-black transition-transform"
                style={{
                  borderColor: color,
                  backgroundColor: `${color}20`,
                  color: '#ffffff',
                }}
              >
                {cleanStarterName.charAt(0).toUpperCase()}
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm"
              style={{ color }}
            >
              {cleanStarterName}
            </h1>

            <p className="text-sm font-semibold text-white/80">
              Starts the round!
            </p>
          </div>
        </div>

        {/* Turn Order Instructions Card */}
        <div className="rounded-3xl bg-card border border-line p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 pb-1 border-b border-line/60">
            <span className="text-xl" aria-hidden>🔄</span>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Turn Order & Rules
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-white/80 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                1
              </span>
              <p>
                Begin with <strong className="text-white" style={{ color }}>{cleanStarterName}</strong>, then proceed <strong>clockwise</strong> around the circle.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                2
              </span>
              <p>
                Each player says <strong>one single word</strong> describing their secret word. The undercover imposter must bluff along!
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                3
              </span>
              <p>
                Discuss and interrogate freely without timers. When your group has found their suspects, tap below to start voting.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Screen>
  )
}
