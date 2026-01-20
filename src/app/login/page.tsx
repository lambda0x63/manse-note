'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (response.ok) {
      window.location.href = '/'
    } else {
      setError(true)
      setTimeout(() => {
        setPassword('')
        setError(false)
        setTouched(false)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* 로고 및 타이틀 */}
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Image 
              src="/yinyang.png" 
              alt="음양" 
              width={100} 
              height={100}
              className="drop-shadow-2xl"
            />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            만세력 노트
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            사주팔자와 대운을 계산하고 관리하는 개인용 도구
          </p>
        </motion.div>

        {/* 로그인 카드 */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                    setTouched(true)
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className={`w-full px-4 py-3 pr-12 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                    error 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 animate-shake' 
                      : touched && password
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 focus:ring-green-200 dark:focus:ring-green-800'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-primary/20 focus:border-primary'
                  }`}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  비밀번호가 일치하지 않습니다
                </div>
              </motion.div>
            )}
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              로그인
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              개발자: 류동윤 · 개인용 도구
            </p>
          </div>
        </motion.div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </motion.div>
    </div>
  )
}