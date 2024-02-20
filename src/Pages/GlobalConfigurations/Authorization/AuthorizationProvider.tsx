import React, { createContext, useContext } from 'react'
import { AuthorizationContextProps, AuthorizationProviderProps } from './types'

const AuthorizationContext = createContext<AuthorizationContextProps>({
    customRoles: {
        customRoles: [],
        possibleRolesMeta: {},
        possibleRolesMetaForHelm: {},
        possibleRolesMetaForCluster: {},
        possibleRolesMetaForJob: {},
    },
    isAutoAssignFlowEnabled: false,
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
