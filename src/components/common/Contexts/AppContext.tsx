/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { createContext, useContext } from 'react'

export interface AppContextType {
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
export const AppContext = createContext<AppContextType>({
    environmentId: null,
    setEnvironmentId: null,
    currentAppName: '',
    setCurrentAppName: noop,
    currentEnvironmentName: '',
    setCurrentEnvironmentName: noop,
})

export function useAppContext() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error(`App context cannout be used outside app scope`)
    }
    return context
}

export const withAppContext = (Component) => (props) => {
    const appContext = useAppContext()
    return <Component {...props} appContext={appContext} />
}
