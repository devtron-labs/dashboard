import moment from 'moment'
import { BulkSelectionEvents, OptionType } from '@devtron-labs/devtron-fe-common-lib'
import {
    ActionTypes,
    APIRoleFilter,
    ChartGroupPermissionsFilter,
    CustomRoleAndMeta,
    CustomRoles,
    DirectPermissionsRoleFilter,
    EntityTypes,
    K8sPermissionFilter,
    MetaPossibleRoles,
    ViewChartGroupPermission,
} from './shared/components/userGroups/userGroups.types'
import { ACCESS_TYPE_MAP, Moment12HourFormat, SERVER_MODE, ZERO_TIME_STRING } from '../../../config'
import { PermissionGroup, User, UserCreateOrUpdatePayload, UserDto } from './types'
import { LAST_LOGIN_TIME_NULL_STATE } from './UserPermissions/constants'
import { useAuthorizationBulkSelection } from './shared/components/BulkSelection'
import { CONFIG_APPROVER_ACTION } from './shared/components/userGroups/UserGroup'

export const transformUserResponse = (_user: UserDto): User => {
    const { lastLoginTime, timeoutWindowExpression, ...user } = _user

    return {
        ...user,
        lastLoginTime:
            lastLoginTime === ZERO_TIME_STRING || !lastLoginTime
                ? LAST_LOGIN_TIME_NULL_STATE
                : moment(lastLoginTime).format(Moment12HourFormat),
        timeToLive:
            timeoutWindowExpression === ZERO_TIME_STRING || !timeoutWindowExpression
                ? ''
                : moment(timeoutWindowExpression).format(Moment12HourFormat),
    }
}

const getUpdatedMetaPossibleRoles = (possibleMetaRoles: MetaPossibleRoles, role: CustomRoles) => ({
    ...possibleMetaRoles,
    [role.roleName]: {
        value: role.roleDisplayName,
        description: role.roleDescription,
    },
})

export const getMetaPossibleRoles = (customRoles: CustomRoles[]): CustomRoleAndMeta => {
    let possibleRolesMeta: MetaPossibleRoles = {}
    let possibleRolesMetaForHelm: MetaPossibleRoles = {}
    let possibleRolesMetaForCluster: MetaPossibleRoles = {}
    let possibleRolesMetaForJob: MetaPossibleRoles = {}

    customRoles.forEach((role) => {
        switch (role.entity) {
            case EntityTypes.DIRECT:
                if (role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                    possibleRolesMeta = getUpdatedMetaPossibleRoles(possibleRolesMeta, role)
                } else if (role.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                    possibleRolesMetaForHelm = getUpdatedMetaPossibleRoles(possibleRolesMetaForHelm, role)
                }
                break
            case EntityTypes.CLUSTER:
                possibleRolesMetaForCluster = getUpdatedMetaPossibleRoles(possibleRolesMetaForCluster, role)
                break
            case EntityTypes.JOB:
                possibleRolesMetaForJob = getUpdatedMetaPossibleRoles(possibleRolesMetaForJob, role)
                break
            default:
        }
    })
    return {
        customRoles,
        possibleRolesMeta,
        possibleRolesMetaForHelm,
        possibleRolesMetaForCluster,
        possibleRolesMetaForJob,
    }
}

/**
 * Provides the role filters for devtron apps
 */
export const getRoleFiltersToExport = (
    roleFilters: User['roleFilters'] | PermissionGroup['roleFilters'],
    customRoles: CustomRoleAndMeta,
) =>
    roleFilters
        .filter((roleFilter) => roleFilter.team && roleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS)
        .map((roleFilter) => ({
            project: roleFilter.team,
            environment: roleFilter.environment?.split(',').join(', ') || 'All existing + future environments',
            application: roleFilter.entityName?.split(',').join(', ') || 'All existing + future applications',
            role: customRoles.possibleRolesMeta[roleFilter.action]?.value || '-',
        }))

export const handleToggleCheckForBulkSelection =
    ({
        isBulkSelectionApplied,
        handleBulkSelection,
        bulkSelectionState,
    }: Pick<
        ReturnType<typeof useAuthorizationBulkSelection>,
        'isBulkSelectionApplied' | 'bulkSelectionState' | 'handleBulkSelection'
    >) =>
    (id: User['id'] | PermissionGroup['id']) => {
        if (isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [id],
                },
            })
            return
        }

        handleBulkSelection(
            bulkSelectionState[id]
                ? {
                      action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                      data: {
                          identifierIds: [id],
                      },
                  }
                : {
                      action: BulkSelectionEvents.SELECT_IDENTIFIER,
                      data: {
                          identifierObject: {
                              ...bulkSelectionState,
                              [id]: true,
                          },
                      },
                  },
        )
    }

const getSelectedPermissionValues = (options: OptionType[]) => {
    return options.some((option) => option.value === '*') ? '' : options.map((option) => option.value).join(',')
}

const getSelectedEnvironments = (permission) => {
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

export const isDirectPermissionFormComplete = (directPermission, setDirectPermission): boolean => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseData(dataList: any[], entity: string, accessType?: string) {
    switch (entity) {
        case EntityTypes.DIRECT:
            if (accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                return dataList.filter(
                    (role) =>
                        role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && role.value !== CONFIG_APPROVER_ACTION.value,
                )
            }
            return dataList.filter((role) => role.accessType === ACCESS_TYPE_MAP.HELM_APPS)

        case EntityTypes.CLUSTER:
        case EntityTypes.CHART_GROUP:
        case EntityTypes.JOB:
            return dataList.filter((role) => role.entity === entity)
        default:
            throw new Error(`Unknown entity ${entity}`)
    }
}
