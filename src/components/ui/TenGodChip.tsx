'use client'

interface TenGodChipProps {
  name?: string
  size?: 'xs' | 'sm'
  className?: string
  variant?: 'category' | 'neutral'
}

export function TenGodChip({ name, size = 'sm', className = '', variant = 'category' }: TenGodChipProps) {
  const base = 'inline-flex items-center justify-center rounded font-medium'
  const padd = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'

  const toneFor = (n?: string) => {
    switch (n) {
      case '비견':
      case '겁재':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
      case '식신':
      case '상관':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      case '정재':
      case '편재':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      case '정관':
      case '편관':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
      case '정인':
      case '편인':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const neutral = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  const tone = variant === 'neutral' ? neutral : toneFor(name)
  return <span className={`${base} ${padd} ${tone} ${className}`}>{name || '−'}</span>
}

// Filled tile variant for consistent UI in tables
interface TenGodTileProps {
  name?: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
  variant?: 'category' | 'neutral' | 'soft'
}

const toneTile = (n?: string) => {
  switch (n) {
    case '비견':
    case '겁재':
      return 'bg-indigo-600 text-white dark:bg-indigo-700'
    case '식신':
    case '상관':
      return 'bg-emerald-600 text-white dark:bg-emerald-700'
    case '정재':
    case '편재':
      return 'bg-amber-600 text-white dark:bg-amber-700'
    case '정관':
    case '편관':
      return 'bg-rose-600 text-white dark:bg-rose-700'
    case '정인':
    case '편인':
      return 'bg-purple-600 text-white dark:bg-purple-700'
    default:
      return 'bg-gray-500 text-white dark:bg-gray-600'
  }
}

export function TenGodTile({ name, size = 'sm', className = '', variant = 'neutral' }: TenGodTileProps) {
  const base = 'rounded-lg text-center font-semibold shadow-sm'
  const padd = size === 'md' ? 'p-3 text-sm' : size === 'sm' ? 'p-2 text-xs' : 'px-2 py-1 text-[11px]'
  const neutral = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  const softText = (n?: string) => {
    switch (n) {
      case '비견':
      case '겁재':
        return 'text-indigo-700 dark:text-indigo-300'
      case '식신':
      case '상관':
        return 'text-emerald-700 dark:text-emerald-300'
      case '정재':
      case '편재':
        return 'text-amber-700 dark:text-amber-300'
      case '정관':
      case '편관':
        return 'text-rose-700 dark:text-rose-300'
      case '정인':
      case '편인':
        return 'text-purple-700 dark:text-purple-300'
      default:
        return 'text-gray-700 dark:text-gray-200'
    }
  }
  const tone = variant === 'neutral' ? neutral : variant === 'category' ? toneTile(name) : `bg-gray-50 dark:bg-gray-800 ${softText(name)}`
  return <div className={`${base} ${padd} ${tone} ${className}`}>{name || '−'}</div>
}
