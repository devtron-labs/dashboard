import { noop } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'

interface AppContext {
    /**
     * environmentId is for history purpose, like have opened cdMaterials of env and want to retain it
     */
    environmentId: number
    setEnvironmentId: (environmentId: number) => void
    /**
     * currentAppName is the app name present in AppHeader from app List only
     */
    currentAppName?: string
    setCurrentAppName?: (currentAppName: string) => void
    /**
     * currentEnvironmentName is the environment name present in EnvHeader from appGroup
     */
    currentEnvironmentName?: string
    setCurrentEnvironmentName?: (currentEnvironmentName: string) => void
}
export const AppContext = React.createContext<AppContext>({
    environmentId: null,
    setEnvironmentId: null,
    currentAppName: '',
    setCurrentAppName: noop,
    currentEnvironmentName: '',
    setCurrentEnvironmentName: noop,
})

export function useAppContext() {
    const context = React.useContext(AppContext)
    if (!context) {
        throw new Error(`App context cannout be used outside app scope`)
    }
    return context
}
