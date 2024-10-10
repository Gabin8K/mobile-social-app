import React, { FunctionComponent, PropsWithChildren, useCallback, useState } from "react"

type UpdateTabType = 'thread' | 'index'
type RefreshTabs = {
  update: (tab: UpdateTabType) => void,
  isUpdateThread?: boolean,
  isUpdateIndex?: boolean,
  clear: () => void,
}

type StateType = {
  isUpdateThread?: boolean,
  isUpdateIndex?: boolean,
}



const RefreshTabsContext = React.createContext<RefreshTabs>({
  update: () => { },
  clear: () => { },
})

export const useRefreshTabs = () => React.useContext(RefreshTabsContext);


const RefreshTabsProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<StateType>({})

  const update = useCallback((tab: UpdateTabType) => {
    if (tab === 'thread') {
      setState(prev => ({ ...prev, isUpdateThread: true }))
    }
    if (tab === 'index') {
      setState(prev => ({ ...prev, isUpdateIndex: true }))
    }
  }, [])


  const clear = () => {
    setState({
      isUpdateThread: false,
      isUpdateIndex: false,
    })
  }

  return (
    <RefreshTabsContext.Provider
      value={{
        clear,
        update,
        isUpdateIndex: state.isUpdateIndex,
        isUpdateThread: state.isUpdateThread,
      }}
    >
      {children}
    </RefreshTabsContext.Provider>
  )
}


export default RefreshTabsProvider