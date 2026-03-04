import React from 'react'

import {IS_WEB} from '#/env'

type StateContext = '1' | '2' | '3'
type SetContext = (value: StateContext) => void

const stateContext = React.createContext<StateContext>('1')
const setContext = React.createContext<SetContext>(() => {})
stateContext.displayName = 'FeedColumnsStateContext'
setContext.displayName = 'FeedColumnsSetContext'

const STORAGE_KEY = 'artsky-feed-columns'

function getStored(): StateContext {
  if (!IS_WEB) {
    return '1'
  }
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === '1' || v === '2' || v === '3') return v
  } catch {}
  return '1'
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [state, setState] = React.useState<StateContext>(() => {
    return getStored()
  })

  const setStateWrapped = React.useCallback(
    (feedColumns: StateContext) => {
      setState(feedColumns)
      try {
        localStorage.setItem(STORAGE_KEY, feedColumns)
      } catch {}
    },
    [setState],
  )

  return (
    <setContext.Provider value={setStateWrapped}>
      <stateContext.Provider value={state}>{children}</stateContext.Provider>
    </setContext.Provider>
  )
}

export function useFeedColumns(): StateContext {
  return React.useContext(stateContext)
}

export function useSetFeedColumns(): SetContext {
  return React.useContext(setContext)
}
