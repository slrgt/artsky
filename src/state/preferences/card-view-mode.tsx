import React from 'react'

import {IS_WEB} from '#/env'

export type CardViewMode = 'default' | 'minimalist' | 'artOnly'

export const CARD_VIEW_LABELS: Record<CardViewMode, string> = {
  default: 'Full Cards',
  minimalist: 'Mini Cards',
  artOnly: 'Art Cards',
}

type CardViewModeContextValue = {
  cardViewMode: CardViewMode
  setCardViewMode: (value: CardViewMode) => void
  cycleCardViewMode: () => void
  minimalist: boolean
  artOnly: boolean
}

const cardViewModeContext = React.createContext<CardViewModeContextValue>({
  cardViewMode: 'default',
  setCardViewMode: () => {},
  cycleCardViewMode: () => {},
  minimalist: false,
  artOnly: false,
})
cardViewModeContext.displayName = 'CardViewModeContext'

const STORAGE_KEY = 'artsky-card-view'

function getStored(): CardViewMode {
  if (!IS_WEB) {
    return 'default'
  }
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'artOnly' || v === 'minimalist') return v
    if (v === '1' || v === 'true') return 'artOnly'
    return 'default'
  } catch {
    return 'default'
  }
}

export function CardViewModeProvider({children}: React.PropsWithChildren<{}>) {
  const [cardViewMode, setCardViewModeState] =
    React.useState<CardViewMode>(getStored)

  const setCardViewMode = React.useCallback((value: CardViewMode) => {
    setCardViewModeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
  }, [])

  const cycleCardViewMode = React.useCallback(() => {
    setCardViewModeState(prev => {
      const next =
        prev === 'default'
          ? 'minimalist'
          : prev === 'minimalist'
            ? 'artOnly'
            : 'default'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {}
      return next
    })
  }, [setCardViewMode])

  const minimalist = cardViewMode === 'minimalist'
  const artOnly = cardViewMode === 'artOnly'

  const value: CardViewModeContextValue = {
    cardViewMode,
    setCardViewMode,
    cycleCardViewMode,
    minimalist,
    artOnly,
  }

  return (
    <cardViewModeContext.Provider value={value}>
      {children}
    </cardViewModeContext.Provider>
  )
}

export function useCardViewMode(): CardViewModeContextValue {
  return React.useContext(cardViewModeContext)
}

export {CardViewModeProvider as Provider}
