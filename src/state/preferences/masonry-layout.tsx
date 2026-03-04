import React from 'react'

import {IS_WEB} from '#/env'

type StateContext = boolean
type SetContext = (value: boolean) => void

const stateContext = React.createContext<StateContext>(false)
const setContext = React.createContext<SetContext>(() => {})
stateContext.displayName = 'MasonryLayoutStateContext'
setContext.displayName = 'MasonryLayoutSetContext'

const STORAGE_KEY = 'artsky-masonry-layout'

function getStored(): StateContext {
  if (!IS_WEB) {
    return false
  }
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'true' || v === 'false') return v === 'true'
  } catch {}
  return false
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [state, setState] = React.useState<StateContext>(() => {
    return getStored()
  })

  const setStateWrapped = React.useCallback(
    (isMasonry: StateContext) => {
      setState(isMasonry)
      try {
        localStorage.setItem(STORAGE_KEY, String(isMasonry))
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

export function useMasonryLayout(): StateContext {
  return React.useContext(stateContext)
}

export function useSetMasonryLayout(): SetContext {
  return React.useContext(setContext)
}
