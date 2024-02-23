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
    userGroups: User['userRoleGroups']
    setUserGroups: React.Dispatch<React.SetStateAction<User['userRoleGroups']>>
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
