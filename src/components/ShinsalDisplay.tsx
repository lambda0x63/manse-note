'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ShinsalResult } from '@/lib/saju/shinsal'

interface ShinsalDisplayProps {
  shinsal: ShinsalResult
  className?: string
}

export function ShinsalDisplay({ shinsal, className }: ShinsalDisplayProps) {
  const [showAll, setShowAll] = useState(false)
  
  if (!shinsal || shinsal.all.length === 0) {
    return <div className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>신살이 없습니다.</div>
  }

  const sorted = [...shinsal.all].sort((a, b) => (b.count || 1) - (a.count || 1))
  const displayItems = showAll ? sorted : sorted.slice(0, 5)
  const hasMore = sorted.length > 5

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          신살 <span className="text-xs font-normal text-gray-500">({sorted.length}개)</span>
        </h4>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            {showAll ? '접기' : `${sorted.length - 5}개 더보기`}
            {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {displayItems.map((s, i) => (
          <span 
            key={`${s.name}-${i}`} 
            className={cn(
              "text-xs px-2.5 py-1.5 rounded-md font-medium transition-all",
              s.category === '성격' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
              s.category === '인연' && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
              s.category === '이동' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
              s.category === '재능' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
              s.category === '장애' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
              s.category === '사고' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
              s.category === '변화' && "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
              s.category === '매력' && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
              s.category === '관계' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
              !s.category && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            )}
          >
            {s.name}
            {s.count && s.count > 1 && (
              <span className="ml-1 text-[10px] opacity-75">×{s.count}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
