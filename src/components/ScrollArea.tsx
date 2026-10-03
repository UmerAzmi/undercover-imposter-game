import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  contentClassName?: string
  maxThumbHeight?: number
  minThumbHeight?: number
  role?: string
  'aria-label'?: string
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    children,
    className = '',
    contentClassName = '',
    maxThumbHeight = 135,
    minThumbHeight = 32,
    role,
    'aria-label': ariaLabel,
    ...props
  },
  forwardedRef,
) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Expose the scrollable viewport DOM element
  useImperativeHandle(forwardedRef, () => viewportRef.current as HTMLDivElement)

  const [hasOverflow, setHasOverflow] = useState(false)
  const [thumbHeight, setThumbHeight] = useState(maxThumbHeight)
  const [thumbTop, setThumbTop] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  const scrollTimerRef = useRef<number | null>(null)

  const updateScrollbar = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport) return

    const clientH = viewport.clientHeight
    const scrollH = viewport.scrollHeight
    const maxScroll = scrollH - clientH

    if (maxScroll <= 2 || clientH <= 0) {
      setHasOverflow(false)
      return
    }

    setHasOverflow(true)
    const trackH = track ? track.clientHeight : clientH
    const rawThumbHeight = (clientH / scrollH) * trackH

    // Cap the thumb height to the 2nd page size (~135px),
    // and naturally decrease it when there is more content on the page
    const effectiveMax = Math.min(maxThumbHeight, trackH * 0.35)
    const calculatedThumbHeight = Math.max(minThumbHeight, Math.min(effectiveMax, rawThumbHeight))
    setThumbHeight(calculatedThumbHeight)

    const availableTrack = trackH - calculatedThumbHeight
    if (availableTrack > 0 && maxScroll > 0) {
      const ratio = Math.max(0, Math.min(1, viewport.scrollTop / maxScroll))
      setThumbTop(ratio * availableTrack)
    } else {
      setThumbTop(0)
    }
  }, [maxThumbHeight, minThumbHeight])

  const handleScroll = () => {
    updateScrollbar()
    setIsScrolling(true)
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current)
    }
    scrollTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false)
    }, 700)
  }

  // Pointer dragging logic for thumb
  const handleThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    setIsDragging(true)

    const startY = e.clientY
    const startScrollTop = viewportRef.current ? viewportRef.current.scrollTop : 0

    const onPointerMove = (moveEvent: PointerEvent) => {
      const viewport = viewportRef.current
      const track = trackRef.current
      if (!viewport || !track) return

      const trackH = track.clientHeight
      const availableTrack = trackH - thumbHeight
      const maxScroll = viewport.scrollHeight - viewport.clientHeight
      if (availableTrack <= 0 || maxScroll <= 0) return

      const deltaY = moveEvent.clientY - startY
      const scrollDelta = (deltaY / availableTrack) * maxScroll
      viewport.scrollTop = startScrollTop + scrollDelta
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId)
      } catch {
        // ignore
      }
      setIsDragging(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  // Clicking track directly jumps scroll
  const handleTrackClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current || !viewportRef.current || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const availableTrack = rect.height - thumbHeight
    if (availableTrack <= 0) return

    const targetRatio = Math.max(0, Math.min(1, (clickY - thumbHeight / 2) / availableTrack))
    const maxScroll = viewportRef.current.scrollHeight - viewportRef.current.clientHeight
    viewportRef.current.scrollTo({ top: targetRatio * maxScroll, behavior: 'smooth' })
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    updateScrollbar()

    const observer = new ResizeObserver(() => {
      updateScrollbar()
    })

    observer.observe(viewport)
    if (viewport.firstElementChild) {
      observer.observe(viewport.firstElementChild)
    }

    return () => {
      observer.disconnect()
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current)
      }
    }
  }, [updateScrollbar])

  // Recalculate on dynamic children updates
  useEffect(() => {
    updateScrollbar()
  }, [children, updateScrollbar])

  const isActive = isDragging || isHovered || isScrolling

  return (
    <div className={`relative flex-1 min-h-0 flex flex-col ${className}`} {...props}>
      <div
        ref={viewportRef}
        role={role}
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain hide-scrollbar ${contentClassName}`}
      >
        {children}
      </div>

      {hasOverflow && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute top-1 bottom-1 right-0 w-[10px] flex justify-end select-none z-30 cursor-pointer"
          aria-hidden="true"
        >
          <div
            onPointerDown={handleThumbPointerDown}
            className={`w-[5px] rounded-full cursor-pointer transition-colors duration-150 ${
              isActive
                ? 'bg-accent shadow-[0_0_6px_rgba(var(--color-accent-rgb),0.6)]'
                : 'bg-accent/55'
            }`}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`,
            }}
          />
        </div>
      )}
    </div>
  )
})
