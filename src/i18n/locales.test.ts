import { afterEach, describe, expect, it } from 'vitest'
import { detectLocale } from './locales'

const ORIGINAL_LANGUAGE = navigator.language

function setLanguage(value: string) {
  Object.defineProperty(navigator, 'language', { value, configurable: true })
}

afterEach(() => {
  setLanguage(ORIGINAL_LANGUAGE)
})

describe('detectLocale', () => {
  it('returns en by default', () => {
    setLanguage('en-US')
    expect(detectLocale()).toBe('en')
    setLanguage('nl-BE')
    expect(detectLocale()).toBe('en')
  })
})
