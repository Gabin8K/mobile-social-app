import { createContext, FunctionComponent, PropsWithChildren, useState } from "react";
import { Snackbar } from "react-native-paper";


type ToastType = {
  message: (message: string) => void
}

export const ToastContext = createContext<ToastType>({
  message: () => { }
})


const ToastProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [message, setMessage] = useState<string>()

  return (
    <ToastContext.Provider
      value={{
        message: setMessage,
      }}
    >
      {children}
      <Snackbar
        visible={!!message}
        onIconPress={() => setMessage(undefined)}
        onDismiss={() => setMessage(undefined)}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  )
}


export default ToastProvider;