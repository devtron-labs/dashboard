import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../../../config'
import {
    ActionTypes,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
    OptionType,
    ViewChartGroupPermission,
} from '../shared/components/userGroups/userGroups.types'
import { UserCreateOrUpdatePayload } from '../types'

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

const millisecondsInDay = 86400000

export const getDateInMilliseconds = (days) => {
    return 1 + new Date().valueOf() + (days ?? 0) * millisecondsInDay
}

const getSelectedPermissionValues = (permissionLabel: OptionType[]) => {
    let entityName = ''
    // eslint-disable-next-line no-restricted-syntax
    for (const _entityName of permissionLabel) {
        if (_entityName.value === '*') {
            break
        } else {
            entityName += !entityName ? _entityName.value : `,${_entityName.value}`
        }
    }
    return entityName
}

export const getSelectedEnvironments = (permission) => {
    if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS || permission.entity === EntityTypes.JOB) {
        return getSelectedPermissionValues(permission.environment)
    }
    const allFutureCluster = {}
    let envList = ''
    permission.environment.forEach((element) => {
        if (element.clusterName === '' && element.value.startsWith('#')) {
            const clusterName = element.value.substring(1)
            allFutureCluster[clusterName] = true
            envList += `${(envList !== '' ? ',' : '') + clusterName}__*`
        } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
            envList += (envList !== '' ? ',' : '') + element.value
        }
    })
    return envList
}

export const createUserPermissionPayload = (
    userId: number,
    userIdentifier: string,
    serverMode: SERVER_MODE,
    userGroups: OptionType[],
    directPermission: DirectPermissionsRoleFilter[],
    chartPermission: ChartGroupPermissionsFilter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    k8sPermission: any[],
    isSuperAdminAccess: boolean,
): UserCreateOrUpdatePayload => {
    const userPermissionPayload: UserCreateOrUpdatePayload = {
        // ID 0 denotes create operation
        id: userId || 0,
        emailId: userIdentifier,
        groups: userGroups.map((group) => group.value),
        roleFilters: [
            ...directPermission
                .filter(
                    (permission) =>
                        permission.team?.value && permission.environment.length && permission.entityName.length,
                )
                .map((permission) => {
                    const payload = {
                        ...permission,
                        action: permission.action.value,
                        team: permission.team.value,
                        environment: getSelectedEnvironments(permission),
                        entityName: getSelectedPermissionValues(permission.entityName),
                        entity: permission.entity,
                        ...(permission.entity === EntityTypes.JOB && {
                            // eslint-disable-next-line no-nested-ternary
                            workflow: permission.workflow?.length
                                ? permission.workflow.find((workflow) => workflow.value === '*')
                                    ? ''
                                    : permission.workflow.map((workflow) => workflow.value).join(',')
                                : '',
                        }),
                    }
                    return payload
                }),
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
                    : permission.resource.map((entity) => entity.value).join(','),
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
        if (chartPermission.action !== ActionTypes.VIEW) {
            userPermissionPayload.roleFilters.push({
                ...ViewChartGroupPermission,
                team: '',
                environment: '',
            })
        }
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
    let isComplete = true
    const tempPermissions = directPermission.reduce((agg, curr) => {
        if (curr.team && curr.entityName.length === 0) {
            isComplete = false
            // eslint-disable-next-line no-param-reassign
            curr.entityNameError = 'Applications are mandatory'
        }
        if (curr.team && curr.environment.length === 0) {
            isComplete = false
            // eslint-disable-next-line no-param-reassign
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
