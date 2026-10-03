import type { UseInstallPromptResult } from '../lib/useInstallPrompt'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { ScreenHeader } from '../components/ScreenHeader'
import { Stepper } from '../components/Stepper'
import { useT } from '../i18n/LocaleProvider'
import type { Settings } from '../game/types'
import { forceRefresh } from '../lib/force-refresh'
import { THEMES } from '../lib/theme'
import { getPlayerColor } from '../lib/playerColors'
import { ScrollArea } from '../components/ScrollArea'

type Props = {
  settings: Settings
  players: string[]
  playerColors?: Record<string, string>
  categoryCount: number
  install: UseInstallPromptResult
  /**
   * 'categories' = setup flow (Home → categories → round setup) → shows pre-round controls and Start button.
   * 'home' = menu settings → shows app prefs (theme, sound, install, credits) and Done button.
   */
  origin: 'home' | 'categories'
  onChange: (s: Settings) => void
  onEditPlayers: () => void
  onStart: () => void
  onBack: () => void
}

const MIN_PLAYERS = 3

export function SettingsScreen({
  settings,
  players,
  playerColors = {},
  categoryCount,
  install,
  origin,
  onChange,
  onEditPlayers,
  onStart,
  onBack,
}: Props) {
  const t = useT()
  const playerCount = players.length
  const maxImposters = Math.max(1, playerCount - 1)
  const canStart = playerCount >= MIN_PLAYERS && categoryCount >= 1
  const isPreRound = origin === 'categories'

  const footer = isPreRound ? (
    <Button onClick={onStart} disabled={!canStart}>
      {t('settings.start')}
    </Button>
  ) : (
    <Button variant="secondary" onClick={onBack}>
      {t('settings.done')}
    </Button>
  )

  return (
    <Screen footer={footer}>
      <ScreenHeader
        title={isPreRound ? 'Round Setup' : t('settings.title')}
        onBack={onBack}
      />

      <ScrollArea
        className="flex-1 min-h-0"
        contentClassName={`pr-2 pb-2 ${isPreRound ? 'space-y-2.5' : 'space-y-3.5'}`}
      >
        {/* Players Card - present in both pre-round and menu */}
        <Card title={t('settings.players.title')} subtitle={t('settings.players.subtitle')}>
          <button
            type="button"
            onClick={onEditPlayers}
            className="w-full flex items-center justify-between gap-3 text-left bg-line/40 hover:bg-line/60 active:bg-line rounded-2xl p-3 border border-line/60 press-ios-soft"
          >
            <div className="flex-1 min-w-0">
              {playerCount === 0 ? (
                <span className="text-sm text-white/50">{t('settings.players.empty')}</span>
              ) : (
                <div className="flex flex-wrap gap-1.5 py-0.5">
                  {players.map((p, i) => {
                    const col = playerColors[p] ?? getPlayerColor(undefined, i)
                    return (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-line/70 border border-white/10"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                        <span className="truncate max-w-[120px]">{p}</span>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            <span className="text-accent text-sm font-semibold shrink-0 pl-1">
              {t('settings.players.edit')} ›
            </span>
          </button>
        </Card>

        {/* PRE-ROUND SETUP CARDS */}
        {isPreRound ? (
          <>
            <Card title={t('settings.imposters.title')} subtitle={t('settings.imposters.subtitle')}>
              <Stepper
                value={settings.imposterCount}
                min={1}
                max={maxImposters}
                decreaseLabel={t('settings.imposters.decrease')}
                increaseLabel={t('settings.imposters.increase')}
                onChange={(n) => onChange({ ...settings, imposterCount: n })}
              />
            </Card>

            <Card title={t('settings.hints.title')} subtitle={t('settings.hints.subtitle')}>
              <Segmented
                label={t('settings.hints.title')}
                value={settings.hintsEnabled}
                options={[
                  { value: false, label: t('settings.hints.off') },
                  { value: true, label: t('settings.hints.on') },
                ]}
                onChange={(v) => onChange({ ...settings, hintsEnabled: v })}
              />
            </Card>

            <Card title={t('settings.voteMode.title')} subtitle={t('settings.voteMode.subtitle')}>
              <Segmented
                label={t('settings.voteMode.title')}
                value={settings.voteMode}
                options={[
                  { value: 'individual', label: t('settings.voteMode.individual') },
                  { value: 'group', label: t('settings.voteMode.group') },
                ]}
                onChange={(v) => onChange({ ...settings, voteMode: v })}
              />
            </Card>
          </>
        ) : (
          /* MENU SETTINGS CARDS */
          <>
            <Card title={t('settings.theme.title')} subtitle={t('settings.theme.subtitle')}>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((theme) => {
                  const isSelected = settings.theme === theme.id
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onChange({ ...settings, theme: theme.id })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border press-ios-soft transition-all ${
                        isSelected
                          ? 'bg-line/90 border-white ring-1 ring-white/30'
                          : 'bg-line/40 border-line hover:border-white/30'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full border shadow-sm transition-transform ${
                          isSelected ? 'scale-110 border-white ring-2 ring-white/40' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className="text-[11px] font-semibold text-white/80 truncate w-full text-center">
                        {theme.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>

            <Card title={t('settings.sound.title')} subtitle={t('settings.sound.subtitle')}>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{t('settings.sound.effects')}</span>
                  <div className="w-36">
                    <Segmented
                      label={t('settings.sound.effects')}
                      value={settings.soundEnabled}
                      options={[
                        { value: false, label: t('settings.hints.off') },
                        { value: true, label: t('settings.hints.on') },
                      ]}
                      onChange={(v) => onChange({ ...settings, soundEnabled: v })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{t('settings.sound.haptics')}</span>
                  <div className="w-36">
                    <Segmented
                      label={t('settings.sound.haptics')}
                      value={settings.hapticsEnabled}
                      options={[
                        { value: false, label: t('settings.hints.off') },
                        { value: true, label: t('settings.hints.on') },
                      ]}
                      onChange={(v) => onChange({ ...settings, hapticsEnabled: v })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title={t('settings.voteMode.title')} subtitle={t('settings.voteMode.subtitle')}>
              <Segmented
                label={t('settings.voteMode.title')}
                value={settings.voteMode}
                options={[
                  { value: 'individual', label: t('settings.voteMode.individual') },
                  { value: 'group', label: t('settings.voteMode.group') },
                ]}
                onChange={(v) => onChange({ ...settings, voteMode: v })}
              />
            </Card>

            <Card title={t('settings.install.title')} subtitle={t('settings.install.subtitle')}>
              <InstallSection install={install} />
            </Card>

            <Credits installed={install.installed} />
          </>
        )}
      </ScrollArea>
    </Screen>
  )
}

function Credits({ installed }: { installed: boolean }) {
  const t = useT()
  return (
    <div className="text-center pt-2 pb-4 space-y-2 text-xs text-white/50">
      <p className="font-semibold text-white/70">{t('settings.credits.builtBy')}</p>
      {installed && (
        <button
          type="button"
          onClick={() => forceRefresh()}
          className="text-white/40 hover:text-white underline underline-offset-2 transition-colors"
        >
          {t('settings.credits.forceRefresh')}
        </button>
      )}
    </div>
  )
}

function InstallSection({ install }: { install: UseInstallPromptResult }) {
  const t = useT()

  if (install.installed) {
    return <p className="text-sm text-success font-semibold">✓ {t('settings.install.alreadyInstalled')}</p>
  }
  if (install.isIOS) {
    return <p className="text-sm text-white/80 leading-snug">{t('settings.install.iosInstructions')}</p>
  }
  if (install.hasPromptEvent) {
    return (
      <Button size="md" onClick={() => install.promptInstall()}>
        {t('settings.install.button')}
      </Button>
    )
  }
  return <p className="text-sm text-white/60 leading-snug">{t('settings.install.unavailable')}</p>
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-line rounded-3xl p-3.5 sm:p-4 shadow-lg">
      <h3 className="font-bold text-base leading-tight text-white">{title}</h3>
      <p className="text-xs text-white/60 mt-0.5 mb-2.5">{subtitle}</p>
      {children}
    </div>
  )
}

type SegmentedProps<T> = {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

function Segmented<T extends string | number | boolean>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid grid-flow-col auto-cols-fr gap-1 p-1 rounded-xl bg-line/60 border border-white/5"
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={
              `h-9 rounded-lg font-semibold text-xs press-ios transition-all ` +
              (selected
                ? 'bg-accent text-white shadow-md shadow-accent/25 border border-white/15'
                : 'bg-transparent text-white/60 hover:text-white')
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
