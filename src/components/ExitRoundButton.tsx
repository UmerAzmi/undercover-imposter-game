import { useState } from 'react'
import { Button } from './Button'
import { useT } from '../i18n/LocaleProvider'

type Props = {
  onConfirm: () => void
}

export function ExitRoundButton({ onConfirm }: Props) {
  const t = useT()
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <div className="absolute top-0 right-0 z-20 pt-safe pr-safe sm:pt-3 sm:pr-3">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={t('play.exit')}
          className="h-10 w-10 rounded-full bg-card/85 backdrop-blur border border-line text-white/80 active:bg-line hover:text-white text-xl press-ios-soft flex items-center justify-center shadow-lg"
        >
          ✕
        </button>
      </div>

      {confirming && (
        <ExitConfirmation
          onCancel={() => setConfirming(false)}
          onConfirm={onConfirm}
        />
      )}
    </>
  )
}

function ExitConfirmation({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const t = useT()
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('play.exitConfirm.title')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-card border border-line rounded-3xl p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold leading-tight">{t('play.exitConfirm.title')}</h2>
        <p className="text-sm text-white/70 leading-snug">{t('play.exitConfirm.body')}</p>
        <div className="flex gap-2 pt-1">
          <div className="flex-1">
            <Button size="md" variant="secondary" onClick={onCancel}>
              {t('play.exitConfirm.keep')}
            </Button>
          </div>
          <div className="flex-1">
            <Button size="md" variant="danger" onClick={onConfirm}>
              {t('play.exitConfirm.quit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
