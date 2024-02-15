import React, { createContext, ReactNode, useContext } from 'react'
import { UserGroup } from './shared/components/userGroups/userGroups.types'

const AuthorizationContext = createContext<UserGroup>({
    customRoles: {
        customRoles: [],
        possibleRolesMeta: {},
        possibleRolesMetaForHelm: {},
        possibleRolesMetaForCluster: {},
        possibleRolesMetaForJob: {},
    },
    isAutoAssignFlowEnabled: false,
})

export const AuthorizationProvider = ({ children, value }: { children: ReactNode; value: UserGroup }) => (
    <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
)

export function useAuthorizationContext() {
    const context = useContext(AuthorizationContext)
    if (!context) {
        throw new Error('Cannot use authorization context as the provider is not wrapped')
    }
    return context
}
