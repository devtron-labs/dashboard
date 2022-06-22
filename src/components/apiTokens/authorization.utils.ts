import React from 'react'
import { toast } from 'react-toastify'
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../config'
import { showError } from '../common'
import {
    ChartGroupPermissionsFilter,
    CreateUser,
    DirectPermissionsRoleFilter,
    OptionType,
} from '../userGroups/userGroups.types'
import { deleteGeneratedAPIToken } from './service'

export function getOptions(customDate) {
    return [
        { value: 7, label: '7 days' },
        { value: 30, label: '30 days' },
        { value: 60, label: '60 days' },
        { value: 90, label: '90 days' },
        { value: customDate, label: 'Custom' },
        { value: 0, label: 'No expiration' },
    ]
}

export const PermissionType = [
    { value: 'SPECIFIC', label: 'Specific permissions' },
    { value: 'SUPERADMIN', label: 'Superadmin permission' },
]

const millisecondsInDay = 86400000

export const getDateInMilliseconds = (days) => {
    return 1 + new Date().valueOf() + (days ?? 0) * millisecondsInDay
}

export const getSelectedEnvironments = (permission) => {
    if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
        return permission.environment.find((env) => env.value === '*')
            ? ''
            : permission.environment.map((env) => env.value).join(',')
    } else {
        let allFutureCluster = {}
        let envList = ''
        permission.environment.forEach((element) => {
            if (element.clusterName === '' && element.value.startsWith('#')) {
                const clusterName = element.value.substring(1)
                allFutureCluster[clusterName] = true
                envList += (envList !== '' ? ',' : '') + clusterName + '__*'
            } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
                envList += (envList !== '' ? ',' : '') + element.value
            }
        })
        return envList
    }
}

export const createUserPermissionPayload = (
    userId: number,
    userIdentifier: string,
    serverMode: SERVER_MODE,
    userGroups: OptionType[],
    directPermission: DirectPermissionsRoleFilter[],
    chartPermission: ChartGroupPermissionsFilter,
    isSuperAdminAccess: boolean,
): CreateUser => {
    const userPermissionPayload: CreateUser = {
        id: userId,
        email_id: userIdentifier,
        groups: userGroups.map((group) => group.value),
        roleFilters: [
            ...directPermission
                .filter(
                    (permission) =>
                        permission.team?.value && permission.environment.length && permission.entityName.length,
                )
                .map((permission) => ({
                    ...permission,
                    action: permission.action.value,
                    team: permission.team.value,
                    environment: getSelectedEnvironments(permission),
                    entityName: permission.entityName.find((entity) => entity.value === '*')
                        ? ''
                        : permission.entityName.map((entity) => entity.value).join(','),
                })),
        ],
        superAdmin: isSuperAdminAccess,
    }
    if (serverMode !== SERVER_MODE.EA_ONLY) {
        userPermissionPayload.roleFilters.push({
            ...chartPermission,
            team: '',
            environment: '',
            entityName: chartPermission.entityName.map((entity) => entity.value).join(','),
        })
    }

    return userPermissionPayload
}
