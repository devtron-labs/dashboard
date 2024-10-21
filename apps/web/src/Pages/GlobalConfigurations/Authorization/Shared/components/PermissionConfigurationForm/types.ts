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

import React from 'react'
import { PermissionType } from '../../../constants'
import {
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    K8sPermissionFilter,
    PermissionGroup,
    User,
} from '../../../types'

export type PermissionConfigurationFormProps = {
    showUserPermissionGroupSelector: boolean
}

export interface PermissionConfigurationFormContext {
    permissionType: PermissionType
    setPermissionType: (permissionType: PermissionType) => void
    data: User | PermissionGroup
    userRoleGroups: User['userRoleGroups']
    setUserRoleGroups: (groups: User['userRoleGroups']) => void
    userStatus: User['userStatus']
    timeToLive: User['timeToLive']
    handleUserStatusUpdate: (updatedStatus: User['userStatus'], updatedTimeToLive?: string) => void
    directPermission: DirectPermissionsRoleFilter[]
    setDirectPermission: (...rest) => void
    chartPermission: ChartGroupPermissionsFilter
    setChartPermission: React.Dispatch<React.SetStateAction<ChartGroupPermissionsFilter>>
    k8sPermission?: K8sPermissionFilter[]
    setK8sPermission?: React.Dispatch<React.SetStateAction<K8sPermissionFilter[]>>
    currentK8sPermissionRef?: React.MutableRefObject<K8sPermissionFilter[]>
    /**
     * Flag to control if status should be shown in the form
     *
     * @default false
     */
    showStatus: boolean
}
