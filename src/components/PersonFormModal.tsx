'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PersonForm, { type PersonFormData } from '@/components/PersonForm'

interface PersonFormModalProps {
  onSubmit: (data: PersonFormData) => Promise<void>
  onClose: () => void
}

export default function PersonFormModal({ onSubmit, onClose }: PersonFormModalProps) {
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="min-h-screen bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md">
            <Card className="bg-card">
              <CardHeader className="relative">
                <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-2 top-2 hover:bg-accent">
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle>인물 등록</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonForm onSubmit={onSubmit} onCancel={onClose} submitText="등록" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
