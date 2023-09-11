import React from 'react'
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../config'
import {
    ChartGroupPermissionsFilter,
    CreateUser,
    DirectPermissionsRoleFilter,
    EntityTypes,
    OptionType,
} from '../userGroups/userGroups.types'

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
    { value: 'SUPERADMIN', label: 'Super admin permission' },
]

const millisecondsInDay = 86400000

export const getDateInMilliseconds = (days) => {
    return 1 + new Date().valueOf() + (days ?? 0) * millisecondsInDay
}

export const getSelectedEnvironments = (permission) => {
    if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
       return getSelectedPermissionValues(permission.environment)
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

const getSelectedPermissionValues = (permissionLabel: OptionType[]) => {
    let entityName = ''
    for (let _entityName of permissionLabel) {
        if (_entityName.value === '*') {
            break
        } else {
            entityName += !entityName ? _entityName.value : `,${_entityName.value}`
        }
    }
    return entityName
}

export const createUserPermissionPayload = (
    userId: number,
    userIdentifier: string,
    serverMode: SERVER_MODE,
    userGroups: OptionType[],
    directPermission: DirectPermissionsRoleFilter[],
    chartPermission: ChartGroupPermissionsFilter,
    k8sPermission: any[],
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
                    entityName: getSelectedPermissionValues(permission.entityName),
                })),
                ...k8sPermission.map((permission) => ({
                    ...permission,
                    entity: EntityTypes.CLUSTER,
                    action: permission.action.value,
                    cluster: permission.cluster.label,
                    group: permission.group.value === '*' ? '' : permission.group.value, 
                    kind: permission.kind.value === '*' ? '' : permission.kind.label,
                    namespace: permission.namespace.value === '*' ? '' : permission.namespace.value,
                    resource: permission.resource.find((entity) => entity.value === '*')
                    ? ''
                    : permission.resource.map((entity) => entity.value).join(',')
                }))
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

export const isTokenExpired = (expiredDate: number): boolean => {
    if (expiredDate === 0) {
        return false
    }

    return getDateInMilliseconds(new Date().valueOf()) > getDateInMilliseconds(expiredDate)
}

export const isFormComplete = (directPermission, setDirectPermission): boolean => {
    let isComplete: boolean = true
    const tempPermissions = directPermission.reduce((agg, curr) => {
        if (curr.team && curr.entityName.length === 0) {
            isComplete = false
            curr.entityNameError = 'Applications are mandatory'
        }
        if (curr.team && curr.environment.length === 0) {
            isComplete = false
            curr.environmentError = 'Environments are mandatory'
        }
        agg.push(curr)
        return agg
    }, [])

    if (!isComplete) {
        setDirectPermission(tempPermissions)
    }

    return isComplete
}
