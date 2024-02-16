import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../../../config'
import {
    ActionTypes,
    APIRoleFilter,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
    K8sPermissionFilter,
    ViewChartGroupPermission,
} from '../shared/components/userGroups/userGroups.types'
import { UserCreateOrUpdatePayload } from '../types'

// TODO (v3): Move the common function to main utils

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

const getSelectedPermissionValues = (options: OptionType[]) => {
    return options.some((option) => option.value === '*') ? '' : options.map((option) => option.value).join(',')
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

export const createUserPermissionPayload = ({
    id,
    userIdentifier,
    userGroups,
    serverMode,
    directPermission,
    chartPermission,
    k8sPermission,
    isSuperAdminPermission,
}: {
    id: number
    userIdentifier: string
    userGroups: OptionType[]
    serverMode: SERVER_MODE
    directPermission: DirectPermissionsRoleFilter[]
    chartPermission: ChartGroupPermissionsFilter
    k8sPermission: K8sPermissionFilter[]
    isSuperAdminPermission: boolean
}): UserCreateOrUpdatePayload => {
    const userPermissionPayload: UserCreateOrUpdatePayload = {
        // ID 0 denotes create operation
        id: id || 0,
        // TODO (v3): Move out the user logic
        emailId: userIdentifier,
        groups: userGroups.map((group) => group.value),
        roleFilters: [
            ...directPermission
                .filter(
                    (permission) =>
                        permission.team?.value && permission.environment.length && permission.entityName.length,
                )
                .map((permission) => ({
                    ...permission,
                    action: permission.action.configApprover
                        ? `${permission.action.value},configApprover`
                        : permission.action.value,
                    team: permission.team.value,
                    environment: getSelectedEnvironments(permission),
                    entityName: getSelectedPermissionValues(permission.entityName),
                    entity: permission.entity,
                    ...(permission.entity === EntityTypes.JOB && {
                        workflow: permission.workflow?.length ? getSelectedPermissionValues(permission.workflow) : '',
                    }),
                })),
            ...k8sPermission.map((permission) => ({
                ...permission,
                entity: EntityTypes.CLUSTER as APIRoleFilter['entity'],
                action: permission.action.value,
                cluster: permission.cluster.label,
                group: permission.group.value === '*' ? '' : permission.group.value,
                kind: permission.kind.value === '*' ? '' : permission.kind.label,
                namespace: permission.namespace.value === '*' ? '' : permission.namespace.value,
                resource: getSelectedPermissionValues(permission.resource),
            })),
        ],
        superAdmin: isSuperAdminPermission,
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
            curr.entityNameError = `${curr.entity === EntityTypes.JOB ? 'Jobs' : 'Applications'} are mandatory`
        }
        if (curr.team && curr.environment.length === 0) {
            isComplete = false
            // eslint-disable-next-line no-param-reassign
            curr.environmentError = 'Environments are mandatory'
        }
        if (curr.team && curr.entity === EntityTypes.JOB && curr.workflow?.length === 0) {
            isComplete = false
            // eslint-disable-next-line no-param-reassign
            curr.workflowError = 'Workflows are mandatory'
        }
        agg.push(curr)
        return agg
    }, [])

    if (!isComplete) {
        setDirectPermission(tempPermissions)
    }

    return isComplete
}
