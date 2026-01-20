'use client'

import { useEffect } from 'react'
import { useLoading } from './LoadingSpinner'
import { setApiLoading } from '@/lib/api'

export function LoadingHook() {
  const loading = useLoading()
  
  useEffect(() => {
    setApiLoading(loading.setLoading)
  }, [loading])
  
  return null
}