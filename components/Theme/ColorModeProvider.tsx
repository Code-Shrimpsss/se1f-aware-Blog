'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

type ColorMode = 'light' | 'dark' | 'system'
type CurrentColorMode = 'light' | 'dark'

type ColorModeContext = {
  colorMode: ColorMode
  currentColorMode: CurrentColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

const ColorModeContext = createContext<ColorModeContext>(null!)

interface ColorModeProviderProps {
  children: ReactNode
}

function getInitialColorMode(): ColorMode {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('pattern.mode')
  if (stored === 'system' || stored === 'dark') return stored
  return 'light'
}

function ColorModeProvider({ children }: ColorModeProviderProps) {
  const [colorMode, _setColorMode] = useState<ColorMode>(getInitialColorMode)
  const [currentColorMode, setCurrentColorMode] = useState<CurrentColorMode>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('pattern.mode')
    if (stored === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return stored === 'dark' ? 'dark' : 'light'
  })

  function applyColorModeDom(mode: string) {
    if (mode === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else if (mode === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('pattern.mode')
    if (stored === 'system' || stored === 'dark') {
      applyColorModeDom(stored)
    } else {
      applyColorModeDom('light')
    }
  }, [])

  const setColorMode = (colorMode: ColorMode) => {
    localStorage.setItem('pattern.mode', colorMode)
    applyColorModeDom(colorMode)
    _setColorMode(colorMode)
  }

  useEffect(() => {
    if (colorMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (mediaQuery.matches) {
        setCurrentColorMode('dark')
      } else {
        setCurrentColorMode('light')
      }
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setCurrentColorMode('dark')
        } else {
          setCurrentColorMode('light')
        }
      }
      mediaQuery.addEventListener('change', listener)
      return () => {
        mediaQuery.removeEventListener('change', listener)
      }
    } else {
      setCurrentColorMode(colorMode)
    }
  }, [colorMode])

  const toggleColorMode = () => {
    if (colorMode === 'light') {
      setColorMode('dark')
    } else if (colorMode === 'dark') {
      setColorMode('system')
    } else {
      setColorMode('light')
    }
  }

  return (
    <ColorModeContext.Provider
      value={{ colorMode, currentColorMode, setColorMode, toggleColorMode }}
    >
      {children}
    </ColorModeContext.Provider>
  )
}

export default ColorModeProvider

export function useColorMode() {
  return useContext(ColorModeContext)
}
