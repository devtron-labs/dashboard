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
    userStatus: User['userStatus']
    setUserStatus: React.Dispatch<React.SetStateAction<User['userStatus']>>
    setUserGroups: React.Dispatch<React.SetStateAction<User['userRoleGroups']>>
    directPermission: DirectPermissionsRoleFilter[]
    setDirectPermission: (...rest) => void
    chartPermission: ChartGroupPermissionsFilter
    setChartPermission: React.Dispatch<React.SetStateAction<ChartGroupPermissionsFilter>>
    k8sPermission?: K8sPermissionFilter[]
    setK8sPermission?: React.Dispatch<React.SetStateAction<K8sPermissionFilter[]>>
    currentK8sPermissionRef?: React.MutableRefObject<K8sPermissionFilter[]>
}
