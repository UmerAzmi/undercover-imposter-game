import { useState } from 'react'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { ScreenHeader } from '../components/ScreenHeader'
import { ScrollArea } from '../components/ScrollArea'
import { useLocale, useT } from '../i18n/LocaleProvider'
import { CATEGORY_IDS } from '../i18n/locales'
import type { CategoryWord, CustomCategory } from '../game/types'

type Props = {
  selected: string[]
  customCategories: CustomCategory[]
  onToggle: (id: string) => void
  onAddCustomCategory: (cat: CustomCategory) => void
  onDeleteCustomCategory: (id: string) => void
  onContinue: () => void
  onBack: () => void
}

export function CategoriesScreen({
  selected,
  customCategories,
  onToggle,
  onAddCustomCategory,
  onDeleteCustomCategory,
  onContinue,
  onBack,
}: Props) {
  const t = useT()
  const { bundle } = useLocale()
  const [showModal, setShowModal] = useState(false)
  const canContinue = selected.length >= 1

  return (
    <>
      <Screen
        footer={
          <Button onClick={onContinue} disabled={!canContinue}>
            <span className="flex items-center justify-between w-full">
              <span>{t('categories.continue')}</span>
              <span className="text-sm font-medium text-white/80">
                {t('categories.countSuffix', { count: selected.length })}
              </span>
            </span>
          </Button>
        }
      >
        <ScreenHeader title={t('categories.title')} onBack={onBack} />

        <ScrollArea className="flex-1 min-h-0" contentClassName="space-y-3 pr-2 pb-2">
          {/* Button to open New Category modal */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full text-left bg-line/40 hover:bg-line/70 border border-dashed border-white/30 rounded-2xl px-4 py-3.5 flex items-center justify-center gap-2 font-semibold text-white/90 active:scale-[0.99] transition-all"
          >
            <span className="text-xl leading-none">✨</span>
            <span>{t('categories.newCategory')}</span>
          </button>

          {/* Custom Categories */}
          {customCategories.map((cat) => {
            const isSelected = selected.includes(cat.id)
            return (
              <div
                key={cat.id}
                className={
                  `relative w-full rounded-2xl bg-card border flex items-start gap-3 p-4 transition-all ` +
                  (isSelected ? 'border-accent ring-2 ring-accent/40' : 'border-line')
                }
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => onToggle(cat.id)}
                  className="flex-1 flex items-start gap-3 text-left min-w-0"
                >
                  <div className="text-3xl leading-none mt-0.5" aria-hidden>{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg leading-tight truncate">{cat.name}</span>
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md bg-accent/20 text-accent shrink-0">
                        {t('categories.custom')}
                      </span>
                    </div>
                    <div className="text-sm text-white/60 mt-1 leading-snug">{cat.description}</div>
                    <div className="text-xs text-white/40 mt-1">
                      {cat.words.length} words
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteCustomCategory(cat.id)
                    }}
                    title={t('categories.modal.delete')}
                    aria-label={t('categories.modal.delete')}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white/40 hover:text-danger active:text-danger active:scale-95"
                  >
                    🗑
                  </button>
                  <div
                    onClick={() => onToggle(cat.id)}
                    className={`cursor-pointer h-6 w-6 rounded-full flex items-center justify-center text-sm ${
                      isSelected ? 'bg-accent text-ink' : 'bg-line text-transparent'
                    }`}
                    aria-hidden
                  >
                    ✓
                  </div>
                </div>
              </div>
            )
          })}

          {/* Built-in Categories */}
          {CATEGORY_IDS.map((id) => {
            const meta = bundle?.categories[id]
            if (!meta) return null
            const isSelected = selected.includes(id)
            return (
              <button
                key={id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => onToggle(id)}
                className={
                  `w-full text-left bg-card rounded-2xl px-4 py-4 flex items-start gap-3 border press-ios-soft ` +
                  (isSelected ? 'border-accent ring-2 ring-accent/40' : 'border-line')
                }
              >
                <div className="text-3xl leading-none mt-0.5" aria-hidden>{meta.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg leading-tight">{meta.name}</div>
                  <div className="text-sm text-white/60 mt-1 leading-snug">{meta.description}</div>
                </div>
                <div
                  className={`h-6 w-6 rounded-full mt-1 flex items-center justify-center text-sm ${
                    isSelected ? 'bg-accent text-ink' : 'bg-line text-transparent'
                  }`}
                  aria-hidden
                >
                  ✓
                </div>
              </button>
            )
          })}
        </ScrollArea>
      </Screen>

      {showModal && (
        <CreateCategoryModal
          onClose={() => setShowModal(false)}
          onSave={(cat) => {
            onAddCustomCategory(cat)
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}

function CreateCategoryModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (cat: CustomCategory) => void
}) {
  const t = useT()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [emoji, setEmoji] = useState('⭐️')
  const [words, setWords] = useState<CategoryWord[]>([
    { word: '', hint: '' },
    { word: '', hint: '' },
    { word: '', hint: '' },
  ])

  const handleWordChange = (index: number, field: 'word' | 'hint', val: string) => {
    setWords((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: val }
      return next
    })
  }

  const addWordRow = () => {
    setWords((prev) => [...prev, { word: '', hint: '' }])
  }

  const removeWordRow = (index: number) => {
    if (words.length <= 1) return
    setWords((prev) => prev.filter((_, i) => i !== index))
  }

  const validWords = words.filter((w) => w.word.trim().length > 0)
  const canSave = name.trim().length > 0 && validWords.length >= 3

  const submit = () => {
    if (!canSave) return
    const custom: CustomCategory = {
      id: `custom:${Date.now()}`,
      name: name.trim(),
      description: desc.trim() || t('categories.custom'),
      emoji: emoji.trim() || '⭐️',
      words: validWords.map((w) => ({ word: w.word.trim(), hint: w.hint.trim() })),
    }
    onSave(custom)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-line rounded-3xl p-5 space-y-4 max-h-[90dvh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <h2 className="text-xl font-bold">{t('categories.modal.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0" contentClassName="space-y-3 pr-2 pb-2">
          <div className="grid grid-cols-[3.5rem_1fr] gap-2">
            <div>
              <label className="text-xs text-white/50 block mb-1">{t('categories.modal.emoji')}</label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-full h-11 bg-ink border border-line rounded-xl text-center text-xl outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">{t('categories.modal.name')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('categories.modal.namePlaceholder')}
                className="w-full h-11 bg-ink border border-line rounded-xl px-3 text-white text-sm outline-none focus:border-accent placeholder:text-white/30"
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">{t('categories.modal.description')}</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t('categories.modal.descPlaceholder')}
              className="w-full h-11 bg-ink border border-line rounded-xl px-3 text-white text-sm outline-none focus:border-accent placeholder:text-white/30"
              maxLength={50}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/70">
                {t('categories.modal.wordsTitle')} ({validWords.length}/3+)
              </label>
              <button
                type="button"
                onClick={addWordRow}
                className="text-xs text-accent font-semibold hover:underline"
              >
                {t('categories.modal.addWord')}
              </button>
            </div>

            <div className="space-y-2">
              {words.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item.word}
                    onChange={(e) => handleWordChange(idx, 'word', e.target.value)}
                    placeholder={t('categories.modal.wordPlaceholder')}
                    className="flex-1 h-10 bg-ink border border-line rounded-xl px-3 text-white text-sm outline-none focus:border-accent placeholder:text-white/30"
                  />
                  <input
                    value={item.hint}
                    onChange={(e) => handleWordChange(idx, 'hint', e.target.value)}
                    placeholder={t('categories.modal.hintPlaceholder')}
                    className="w-32 sm:w-40 h-10 bg-ink border border-line rounded-xl px-3 text-white text-xs outline-none focus:border-accent placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeWordRow(idx)}
                    disabled={words.length <= 1}
                    className="h-9 w-9 text-white/40 hover:text-white active:scale-95 disabled:opacity-20 flex items-center justify-center text-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {!canSave && (
              <p className="text-xs text-white/40 mt-2">
                {t('categories.modal.minWordsHint')}
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-2 border-t border-line">
          <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
            {t('categories.modal.cancel')}
          </Button>
          <Button size="md" disabled={!canSave} onClick={submit} className="flex-1">
            {t('categories.modal.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
