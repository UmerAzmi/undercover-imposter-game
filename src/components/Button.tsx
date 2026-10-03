import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'md' | 'lg'
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent via-accent to-accent/90 text-white font-bold tracking-tight shadow-[0_0_24px_rgba(var(--color-accent-rgb),0.35)] border border-white/20 hover:border-white/35 active:scale-[0.985] disabled:opacity-35 disabled:shadow-none disabled:cursor-not-allowed',
  secondary:
    'bg-card/90 text-white border border-line/80 hover:border-white/30 shadow-md active:bg-line active:scale-[0.985]',
  ghost:
    'bg-white/[0.04] text-white/80 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] active:scale-[0.985]',
  danger:
    'bg-gradient-to-r from-danger to-danger/90 text-white font-bold tracking-tight shadow-[0_0_24px_rgba(244,63,94,0.35)] border border-white/20 active:scale-[0.985]',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  ...rest
}: Props) {
  const sizeCls = size === 'lg' ? 'h-14 text-lg' : 'h-11 text-base'
  return (
    <button
      type={rest.type ?? 'button'}
      className={
        `${sizeCls} ${VARIANTS[variant]} px-6 rounded-2xl font-semibold tracking-tight w-full press-ios ${className}`
      }
      {...rest}
    >
      {children}
    </button>
  )
}
