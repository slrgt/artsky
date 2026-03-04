import React from 'react'

import {IS_WEB} from '#/env'

export type LayoutMode = 'twitter' | 'pinterest'

type LayoutModeContextValue = {
  layoutMode: LayoutMode
  setLayoutMode: (value: LayoutMode) => void
  toggleLayoutMode: () => void
}

const layoutModeContext = React.createContext<LayoutModeContextValue>({
  layoutMode: 'twitter',
  setLayoutMode: () => {},
  toggleLayoutMode: () => {},
})
layoutModeContext.displayName = 'LayoutModeContext'

const STORAGE_KEY = 'artsky-layout-mode'

function getStored(): LayoutMode {
  if (!IS_WEB) {
    return 'twitter'
  }
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'pinterest') return 'pinterest'
    return 'twitter'
  } catch {
    return 'twitter'
  }
}

export function LayoutModeProvider({children}: React.PropsWithChildren<{}>) {
  const [layoutMode, setLayoutModeState] = React.useState<LayoutMode>(getStored)

  const setLayoutMode = React.useCallback((value: LayoutMode) => {
    setLayoutModeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
  }, [])

  const toggleLayoutMode = React.useCallback(() => {
    setLayoutModeState(prev => {
      const next = prev === 'twitter' ? 'pinterest' : 'twitter'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {}
      return next
    })
  }, [])

  const value: LayoutModeContextValue = {
    layoutMode,
    setLayoutMode,
    toggleLayoutMode,
  }

  return (
    <layoutModeContext.Provider value={value}>
      {children}
    </layoutModeContext.Provider>
  )
}

export function useLayoutMode(): LayoutModeContextValue {
  return React.useContext(layoutModeContext)
}

export {LayoutModeProvider as Provider}
