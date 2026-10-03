import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Screen({ children, footer, className = '' }: Props) {
  return (
    <div className={`flex-1 flex flex-col w-full h-full relative overflow-hidden pt-safe pl-safe pr-safe ${className}`}>
      <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden w-full relative">
        {children}
      </div>
      {footer && (
        <div className="w-full px-4 pt-2 pb-safe sm:pb-3 shrink-0">{footer}</div>
      )}
    </div>
  )
}
