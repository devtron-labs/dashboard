import { UserStatus } from '@devtron-labs/devtron-fe-common-lib'
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { ActionTypes, EntityTypes, PermissionType } from '../../../constants'
import { getDefaultStatusAndTimeout } from '../../../libUtils'
import {
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    K8sPermissionFilter,
    PermissionGroup,
    User,
} from '../../../types'
import { PermissionConfigurationFormContext } from './types'

const changeStatusToInactiveIfTemporary = importComponentFromFELibrary(
    'changeStatusToInactiveIfTemporary',
    () => ({}),
    'function',
)

const context = createContext<PermissionConfigurationFormContext>(null)

export const PermissionConfigurationFormProvider = ({
    children,
    data = {} as User | PermissionGroup,
    showStatus = false,
}: {
    children: ReactNode
    data: User | PermissionGroup
    showStatus: boolean
}) => {
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)

    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
        ...getDefaultStatusAndTimeout(),
    })
    const [k8sPermission, setK8sPermission] = useState<K8sPermissionFilter[]>([])

    const currentK8sPermissionRef = useRef<K8sPermissionFilter[]>([])
    const [userGroups, setUserGroups] = useState<User['userRoleGroups']>([])
    const [userStatus, setUserStatus] = useState<User['userStatus']>()
    const [timeToLive, setTimeToLive] = useState<User['timeToLive']>()

    useEffect(() => {
        if (data) {
            setPermissionType(data.superAdmin ? PermissionType.SUPER_ADMIN : PermissionType.SPECIFIC)
        }
    }, [data])

    const handleUserStatusUpdate = (updatedStatus: User['userStatus'], updatedTimeToLive?: User['timeToLive']) => {
        setUserStatus(updatedStatus)
        setTimeToLive(updatedTimeToLive)

        // Mark the permission group mapping and direct permission level status to inactive for temporary accesses
        // Not required if the user level timeToLive is less than the permission level timeToLive
        // Note: Not updating for chart permissions since the status is read only
        if (updatedStatus === UserStatus.inactive) {
            setUserGroups(
                userGroups.map((userGroup) => ({
                    ...userGroup,
                    ...changeStatusToInactiveIfTemporary(userGroup.status, userGroup.timeToLive),
                })),
            )
            setDirectPermission(
                directPermission.map((permission) => ({
                    ...permission,
                    ...changeStatusToInactiveIfTemporary(permission.status, permission.timeToLive),
                })),
            )
            setK8sPermission(
                k8sPermission.map((permission) => ({
                    ...permission,
                    ...changeStatusToInactiveIfTemporary(permission.status, permission.timeToLive),
                })),
            )
        }
    }

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
            timeToLive,
            handleUserStatusUpdate,
            data,
            showStatus,
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
            timeToLive,
            handleUserStatusUpdate,
            data,
            showStatus,
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
