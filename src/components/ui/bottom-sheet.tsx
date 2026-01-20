'use client'

import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  height?: string
}

export function BottomSheet({ isOpen, onClose, children, title, height = "90dvh" }: BottomSheetProps) {
  const controls = useDragControls()
  useEffect(() => {
    if (isOpen) {
      // iOS PWA에서 body 스크롤 잠금으로 인한 스크롤 차단 이슈 방지
      // overflow 대신 터치 스크롤은 자식 컨테이너에만 허용
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { velocity }) => {
              if (velocity.y > 500) {
                onClose()
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 overflow-hidden"
            style={{ maxHeight: height }}
          >
            {/* 드래그 핸들 */}
            <div
              className="flex justify-center pt-3 pb-2"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* 헤더 */}
            {title && (
              <div className="px-5 pb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* 컨텐츠 */}
            <div
              className="px-5 overflow-y-auto"
              style={{
                maxHeight: `calc(${height} - 60px)`,
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)'
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
