import React from 'react'

export function Yin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M12 2C9.34784 2 6.8043 3.05357 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C6.8043 20.9464 9.34784 22 12 22C12 19.3478 10.9464 16.8043 9.07107 14.9289C7.19571 13.0536 4.65217 12 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z" 
        fill="currentColor"
      />
      <circle cx="12" cy="6" r="2" fill="white"/>
      <circle cx="12" cy="18" r="2" fill="currentColor"/>
    </svg>
  )
}

export function Yang({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C12 19.3478 13.0536 16.8043 14.9289 14.9289C16.8043 13.0536 19.3478 12 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2Z" 
        fill="currentColor"
      />
      <circle cx="12" cy="6" r="2" fill="currentColor"/>
      <circle cx="12" cy="18" r="2" fill="white"/>
    </svg>
  )
}