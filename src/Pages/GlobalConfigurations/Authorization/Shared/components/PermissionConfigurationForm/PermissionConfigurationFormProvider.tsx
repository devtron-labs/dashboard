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

import { UserStatus, EntityTypes, useGetUserRoles, ActionTypes } from '@devtron-labs/devtron-fe-common-lib'
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { PermissionType } from '../../../constants'
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
    // isLoggedInUserSuperAdmin and canManageAllAccess here denotes permissions for the logged in user
    const { isSuperAdmin: isLoggedInUserSuperAdmin, canManageAllAccess } = useGetUserRoles()
    const [isSaveDisabled, setIsSaveDisabled] = useState(false)
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)
    const [allowManageAllAccess, setAllowManageAllAccess] = useState<boolean>()
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
        ...getDefaultStatusAndTimeout(),
    })
    const [k8sPermission, setK8sPermission] = useState<K8sPermissionFilter[]>([])

    const currentK8sPermissionRef = useRef<K8sPermissionFilter[]>([])
    const [userRoleGroups, _setUserRoleGroups] = useState<User['userRoleGroups']>([])
    const [userStatus, setUserStatus] = useState<User['userStatus']>()
    const [timeToLive, setTimeToLive] = useState<User['timeToLive']>()

    /**
     * Sorts the groups alphabetically by name
     */
    const setUserRoleGroups = (groups: User['userRoleGroups'] | React.SetStateAction<User['userRoleGroups']>) => {
        _setUserRoleGroups((currentGroups) => {
            // Determine the nextState
            const nextState = (typeof groups === 'function' ? groups(currentGroups) : groups).sort((a, b) =>
                a.name.localeCompare(b.name),
            )
            return nextState
        })
    }

    useEffect(() => {
        if (data) {
            setPermissionType(data.superAdmin ? PermissionType.SUPER_ADMIN : PermissionType.SPECIFIC)
            setAllowManageAllAccess(data.canManageAllAccess ?? false)
        }
    }, [data])

    const handleUserStatusUpdate = (updatedStatus: User['userStatus'], updatedTimeToLive?: User['timeToLive']) => {
        setUserStatus(updatedStatus)
        setTimeToLive(updatedTimeToLive)

        // Mark the permission group mapping and direct permission level status to inactive for temporary accesses
        // Not required if the user level timeToLive is less than the permission level timeToLive
        // Note: Not updating for chart permissions since the status is read only
        if (updatedStatus === UserStatus.inactive) {
            setUserRoleGroups((_userGroups) =>
                _userGroups.map((userGroup) => ({
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
            userRoleGroups,
            setUserRoleGroups,
            userStatus,
            timeToLive,
            handleUserStatusUpdate,
            data,
            showStatus,
            isSaveDisabled,
            setIsSaveDisabled,
            allowManageAllAccess,
            setAllowManageAllAccess,
            isLoggedInUserSuperAdmin,
            canManageAllAccess,
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
            userRoleGroups,
            setUserRoleGroups,
            userStatus,
            timeToLive,
            handleUserStatusUpdate,
            data,
            showStatus,
            isSaveDisabled,
            allowManageAllAccess,
            setAllowManageAllAccess,
            isLoggedInUserSuperAdmin,
            canManageAllAccess,
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
