import React from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  variant?: 'full' | 'container' | 'narrow' | 'wide'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function ResponsiveContainer({
  children,
  className = '',
  variant = 'container',
  padding = 'md',
  breakpoint = 'lg'
}: ResponsiveContainerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const getVariantClasses = () => {
    switch (variant) {
      case 'full':
        return 'w-full'
      case 'narrow':
        return 'max-w-4xl mx-auto'
      case 'wide':
        return 'max-w-screen-2xl mx-auto'
      case 'container':
      default:
        return 'container mx-auto'
    }
  }

  const getPaddingClasses = () => {
    if (padding === 'none') return ''
    
    const basePadding = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6'
    }

    const mobilePadding = {
      sm: 'px-4 py-2',
      md: 'px-4 py-4',
      lg: 'px-4 py-6'
    }

    return isMobile ? mobilePadding[padding] : basePadding[padding]
  }

  return (
    <div className={cn(
      getVariantClasses(),
      getPaddingClasses(),
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  equalHeight?: boolean
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  equalHeight = false
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const getGridCols = () => {
    const { mobile = 1, tablet = 2, desktop = 3 } = cols
    return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`
  }

  return (
    <div className={cn(
      'grid',
      getGridCols(),
      gapClasses[gap],
      equalHeight && 'auto-rows-fr',
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: React.ReactNode
  className?: string
  direction?: {
    mobile?: 'row' | 'column'
    tablet?: 'row' | 'column'
    desktop?: 'row' | 'column'
  }
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: 'sm' | 'md' | 'lg'
  wrap?: boolean
}

export function ResponsiveStack({
  children,
  className = '',
  direction = { mobile: 'column', tablet: 'row', desktop: 'row' },
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }

  const getDirectionClasses = () => {
    const { mobile = 'column', tablet = 'row', desktop = 'row' } = direction
    const mobileClass = mobile === 'row' ? 'flex-row' : 'flex-col'
    const tabletClass = tablet === 'row' ? 'md:flex-row' : 'md:flex-col'
    const desktopClass = desktop === 'row' ? 'lg:flex-row' : 'lg:flex-col'
    
    return `${mobileClass} ${tabletClass} ${desktopClass}`
  }

  return (
    <div className={cn(
      'flex',
      getDirectionClasses(),
      alignClasses[align],
      justifyClasses[justify],
      gapClasses[gap],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileOptimizedCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  onClick?: () => void
}

export function MobileOptimizedCard({
  children,
  className = '',
  padding = 'md',
  clickable = false,
  onClick
}: MobileOptimizedCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8'
  }

  return (
    <div 
      className={cn(
        'bg-card border border-border rounded-lg shadow-sm',
        paddingClasses[padding],
        clickable && 'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]',
        isMobile && clickable && 'active:bg-accent/50',
        className
      )}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  )
}