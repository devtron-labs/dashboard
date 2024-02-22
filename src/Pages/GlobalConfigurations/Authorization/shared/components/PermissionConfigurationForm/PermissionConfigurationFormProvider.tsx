import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { ActionTypes, EntityTypes, PermissionType } from '../../../constants'
import {
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    K8sPermissionFilter,
    PermissionGroup,
    User,
} from '../../../types'
import { PermissionConfigurationFormContext } from './types'

const context = createContext<PermissionConfigurationFormContext>(null)

export const PermissionConfigurationFormProvider = ({
    children,
    data = {} as User | PermissionGroup,
}: {
    children: ReactNode
    data: User | PermissionGroup
}) => {
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)

    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    const [k8sPermission, setK8sPermission] = useState<K8sPermissionFilter[]>([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentK8sPermissionRef = useRef<any[]>([])
    const [userGroups, setUserGroups] = useState<User['userRoleGroups']>([])
    const [userStatus, setUserStatus] = useState<User['userStatus']>()

    const value = useMemo(
        () => ({
            permissionType,
            setPermissionType,
            directPermission,
            setDirectPermission,
            chartPermission,
            setChartPermission,
            k8sPermission,
            setK8sPermission,
            currentK8sPermissionRef,
            userGroups,
            setUserGroups,
            userStatus,
            setUserStatus,
            data,
        }),
        [
            permissionType,
            setPermissionType,
            directPermission,
            setDirectPermission,
            chartPermission,
            setChartPermission,
            k8sPermission,
            setK8sPermission,
            currentK8sPermissionRef,
            userGroups,
            setUserGroups,
            userStatus,
            setUserStatus,
            data,
        ],
    )

    return <context.Provider value={value}>{children}</context.Provider>
}

export const usePermissionConfiguration = () => {
    const value = useContext(context)

    if (!value) {
        throw new Error('Please wrap with PermissionConfigurationFormProvider to use the hook')
    }

    return value
}
