import React from 'react'

interface AppContext {
    environmentId: number
    setEnvironmentId: (environmentId: number) => void
}
export const AppContext = React.createContext<AppContext>({
    environmentId: null,
    setEnvironmentId: null,
})

export function useAppContext() {
    const context = React.useContext(AppContext)
    if (!context) {
        throw new Error(`App context cannout be used outside app scope`)
    }
    return context
}
