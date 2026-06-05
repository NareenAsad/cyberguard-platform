'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [ringPosition, setRingPosition] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Add cursor-hiding class on mount
    document.body.classList.add('custom-cursor-active')

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovered(true)
      } else {
        setIsHovered(false)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
    }
  }, [])

  // Smooth ring follow effect
  useEffect(() => {
    let handle: number
    const follow = () => {
      setRingPosition(prev => {
        const dx = position.x - prev.x
        const dy = position.y - prev.y
        // Apply smooth interpolation factor
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        }
      })
      handle = requestAnimationFrame(follow)
    }
    handle = requestAnimationFrame(follow)
    return () => cancelAnimationFrame(handle)
  }, [position])

  if (!isVisible) return null

  return (
    <>
      {/* Center dot cursor */}
      <div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-primary pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out hidden md:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 4.5 : 1})`,
          opacity: isHovered ? 0.18 : 1,
          mixBlendMode: 'difference',
        }}
      />
      {/* Outer tracking ring cursor */}
      <div
        className="fixed top-0 left-0 rounded-full border border-primary/50 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out hidden md:block"
        style={{
          left: `${ringPosition.x}px`,
          top: `${ringPosition.y}px`,
          width: isHovered ? '0px' : '36px',
          height: isHovered ? '0px' : '36px',
          opacity: isHovered ? 0 : 1,
        }}
      />
    </>
  )
}
