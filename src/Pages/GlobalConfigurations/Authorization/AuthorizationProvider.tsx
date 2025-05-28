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

import { createContext, useContext } from 'react'

import { AuthorizationContextProps, AuthorizationProviderProps } from './types'

const AuthorizationContext = createContext<AuthorizationContextProps>({
    customRoles: {
        customRoles: [],
        possibleRolesMetaForDevtron: {},
        possibleJobRoles: [],
        possibleRolesMetaForCluster: {},
    },
    isAutoAssignFlowEnabled: false,
    authorizationContainerRef: { current: null },
})

export const AuthorizationProvider = ({ children, value }: AuthorizationProviderProps) => (
    <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
)

export function useAuthorizationContext() {
    const context = useContext(AuthorizationContext)
    if (!context) {
        throw new Error('Cannot use authorization context as the provider is not wrapped')
    }
    return context
}
