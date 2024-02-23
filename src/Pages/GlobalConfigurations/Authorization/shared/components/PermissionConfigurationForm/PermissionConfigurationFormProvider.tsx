import { UserStatus } from '@devtron-labs/devtron-fe-common-lib'
import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { ActionTypes, EntityTypes, PermissionType } from '../../../constants'
import { getDefaultStatusAndTimeout, getFormattedTimeToLive } from '../../../libUtils'
import {
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    K8sPermissionFilter,
    PermissionGroup,
    User,
} from '../../../types'
import { PermissionConfigurationFormContext } from './types'

const changeTemporaryStatusToInactive = importComponentFromFELibrary(
    'changeTemporaryStatusToInactive',
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

    const handleUserStatusUpdate = (updatedStatus: User['userStatus'], updatedTimeToLive?: User['timeToLive']) => {
        setUserStatus(updatedStatus)
        setTimeToLive(getFormattedTimeToLive(updatedTimeToLive))

        // Mark the permission group mapping and direct permission level status to inactive for temporary accesses
        // Not required if the user level timeToLive is less than the permission level timeToLive
        // Note: Not updating for chart permissions since the status is read only
        if (updatedStatus === UserStatus.inactive) {
            setUserGroups(
                userGroups.map((userGroup) => ({
                    ...userGroup,
                    ...changeTemporaryStatusToInactive(userGroup.status, userGroup.timeToLive),
                })),
            )
            setDirectPermission(
                directPermission.map((permission) => ({
                    ...permission,
                    ...changeTemporaryStatusToInactive(permission.status, permission.timeToLive),
                })),
            )
            setK8sPermission(
                k8sPermission.map((permission) => ({
                    ...permission,
                    ...changeTemporaryStatusToInactive(permission.status, permission.timeToLive),
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
