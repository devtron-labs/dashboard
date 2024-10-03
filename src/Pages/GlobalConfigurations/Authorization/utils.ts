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

import moment from 'moment'
import {
    BulkSelectionEvents,
    noop,
    OptionType,
    ToastManager,
    ToastVariantType,
    UserStatus,
    UserStatusDto,
    ZERO_TIME_STRING,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    ACCESS_TYPE_MAP,
    Moment12HourFormat,
    REQUIRED_FIELDS_MISSING,
    SELECT_ALL_VALUE,
    SERVER_MODE,
} from '../../../config'
import {
    APIRoleFilter,
    APIRoleFilterDto,
    CreateUserPermissionPayloadParams,
    CustomRoleAndMeta,
    CustomRoles,
    DirectPermissionsRoleFilter,
    MetaPossibleRoles,
    PermissionGroup,
    PermissionGroupDto,
    User,
    UserCreateOrUpdateParamsType,
    UserDto,
} from './types'
import { LAST_LOGIN_TIME_NULL_STATE } from './UserPermissions/constants'
import { useAuthorizationBulkSelection } from './Shared/components/BulkSelection'
import {
    CONFIG_APPROVER_ACTION,
    ARTIFACT_PROMOTER_ACTION,
    ActionTypes,
    EntityTypes,
    PermissionType,
    ViewChartGroupPermission,
} from './constants'
import { AppIdWorkflowNamesMapping } from '../../../services/service.types'
import { ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE } from './Shared/components/AppPermissions/constants'
import { importComponentFromFELibrary } from '../../../components/common'
import { getFormattedTimeToLive, getParsedUserGroupList } from './libUtils'

const getUserStatus: (status: UserStatusDto, timeToLive: string) => UserStatus = importComponentFromFELibrary(
    'getUserStatus',
    noop,
    'function',
)
const getStatusExportText: (status: UserStatus, timeToLive: string) => string = importComponentFromFELibrary(
    'getStatusExportText',
    noop,
    'function',
)

const transformRoleFilters = (roleFilters: APIRoleFilterDto[]): APIRoleFilter[] =>
    roleFilters?.map(
        ({ status: roleFilterStatus, timeoutWindowExpression: roleFilterTimeoutWindowExpression, ...roleFilter }) => {
            const roleFilterTimeToLive = getFormattedTimeToLive(roleFilterTimeoutWindowExpression)

            return {
                ...roleFilter,
                status: getUserStatus(roleFilterStatus, roleFilterTimeToLive),
                timeToLive: roleFilterTimeToLive,
            }
        },
    ) ?? []

export const transformUserResponse = (_user: UserDto): User => {
    const {
        lastLoginTime,
        timeoutWindowExpression,
        email_id: emailId,
        userStatus,
        userRoleGroups,
        roleFilters,
        userGroups,
        ...user
    } = _user
    const timeToLive = getFormattedTimeToLive(timeoutWindowExpression)

    return {
        ...user,
        emailId,
        lastLoginTime:
            lastLoginTime === ZERO_TIME_STRING || !lastLoginTime
                ? LAST_LOGIN_TIME_NULL_STATE
                : moment(lastLoginTime).format(Moment12HourFormat),
        userStatus: getUserStatus(userStatus, timeToLive),
        timeToLive,
        userRoleGroups:
            userRoleGroups?.map(
                ({
                    roleGroup: { id, name, description },
                    status: groupStatus,
                    timeoutWindowExpression: groupTimeoutWindowExpression,
                }) => {
                    const groupTimeToLive = getFormattedTimeToLive(groupTimeoutWindowExpression)

                    return {
                        id,
                        name,
                        description,
                        status: getUserStatus(groupStatus, groupTimeToLive),
                        timeToLive: groupTimeToLive,
                    }
                },
            ) ?? [],
        roleFilters: transformRoleFilters(roleFilters),
        userGroups: getParsedUserGroupList(userGroups),
    }
}

export const transformPermissionGroupResponse = (_permissionGroup: PermissionGroupDto): PermissionGroup => {
    const { roleFilters, ...permissionGroup } = _permissionGroup

    return {
        ...permissionGroup,
        roleFilters: transformRoleFilters(roleFilters),
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
    { showStatus = false }: { showStatus?: boolean } = {},
) =>
    roleFilters
        .filter((roleFilter) => roleFilter.team && roleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS)
        .map((roleFilter) => ({
            project: roleFilter.team,
            environment: roleFilter.environment?.split(',').join(', ') || 'All existing + future environments',
            application: roleFilter.entityName?.split(',').join(', ') || 'All existing + future applications',
            role: customRoles.possibleRolesMeta[roleFilter.action]?.value || '-',
            ...(showStatus && {
                permissionStatus: getStatusExportText(roleFilter.status, roleFilter.timeToLive),
            }),
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

const getSelectedPermissionValues = (options: OptionType[]) =>
    options.some((option) => option.value === SELECT_ALL_VALUE) ? '' : options.map((option) => option.value).join(',')

const getSelectedEnvironments = (permission) => {
    if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS || permission.entity === EntityTypes.JOB) {
        return getSelectedPermissionValues(permission.environment)
    }
    const allFutureCluster = {}
    let envList = ''
    permission.environment.forEach((element) => {
        if (element.clusterName === '' && element.value.startsWith(ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE)) {
            const clusterName = element.value.substring(1)
            allFutureCluster[clusterName] = true
            envList += `${(envList !== '' ? ',' : '') + clusterName}__${SELECT_ALL_VALUE}`
        } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
            envList += (envList !== '' ? ',' : '') + element.value
        }
    })
    return envList
}

const getPermissionActionValue = (permission: DirectPermissionsRoleFilter) => {
    const labels = [permission.action.value]

    if (permission.action.configApprover) {
        labels.push(CONFIG_APPROVER_ACTION.value)
    }
    if (permission.action.artifactPromoter) {
        labels.push(ARTIFACT_PROMOTER_ACTION.value)
    }

    return labels.join(',')
}

const getCommaSeperatedNamespaceList = (namespaces: OptionType[]) => {
    if (namespaces.some((el) => el.value === SELECT_ALL_VALUE)) {
        return ''
    }
    return namespaces.map((el) => el.value).join(',')
}

export const getRoleFilters = ({
    directPermission,
    k8sPermission,
    chartPermission,
    serverMode,
}: Pick<
    CreateUserPermissionPayloadParams,
    'chartPermission' | 'directPermission' | 'serverMode' | 'k8sPermission'
>) => {
    const roleFilters: UserCreateOrUpdateParamsType['roleFilters'] = [
        ...directPermission
            .filter(
                (permission) => permission.team?.value && permission.environment.length && permission.entityName.length,
            )
            .map((permission) => ({
                ...permission,
                action: getPermissionActionValue(permission),
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
            group: permission.group.value === SELECT_ALL_VALUE ? '' : permission.group.value,
            kind: permission.kind.value === SELECT_ALL_VALUE ? '' : permission.kind.label,
            namespace: getCommaSeperatedNamespaceList(permission.namespace),
            resource: getSelectedPermissionValues(permission.resource),
        })),
    ]

    if (serverMode !== SERVER_MODE.EA_ONLY) {
        roleFilters.push({
            ...chartPermission,
            team: '',
            environment: '',
            entityName: chartPermission.entityName?.map((entity) => entity.value).join(',') ?? '',
        })
        if (chartPermission.action !== ActionTypes.VIEW) {
            roleFilters.push({
                ...ViewChartGroupPermission,
                team: '',
                environment: '',
            })
        }
    }

    return roleFilters
}

export const getIsSuperAdminPermission = (permissionType: PermissionType) =>
    permissionType === PermissionType.SUPER_ADMIN

export const createUserPermissionPayload = ({
    id,
    userIdentifier,
    userRoleGroups,
    serverMode,
    directPermission,
    chartPermission,
    k8sPermission,
    permissionType,
    userStatus,
    timeToLive,
    userGroups,
}: CreateUserPermissionPayloadParams): UserCreateOrUpdateParamsType => ({
    // ID 0 denotes create operation
    id: id || 0,
    emailId: userIdentifier,
    userRoleGroups,
    superAdmin: getIsSuperAdminPermission(permissionType),
    userStatus,
    timeToLive,
    roleFilters: getRoleFilters({
        k8sPermission,
        directPermission,
        serverMode,
        chartPermission,
    }),
    userGroups,
})

export const isDirectPermissionFormComplete = (directPermission, setDirectPermission): boolean => {
    let isComplete = true
    const tempPermissions = directPermission.reduce((agg, curr) => {
        if (curr.team) {
            if (curr.entityName.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.entityNameError = `${curr.entity === EntityTypes.JOB ? 'Jobs' : 'Applications'} are mandatory`
            }
            if (curr.environment.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.environmentError = 'Environments are mandatory'
            }
            if (curr.entity === EntityTypes.JOB && curr.workflow?.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.workflowError = 'Workflows are mandatory'
            }
        }
        agg.push(curr)
        return agg
    }, [])

    if (!isComplete) {
        ToastManager.showToast({
            variant: ToastVariantType.error,
            description: REQUIRED_FIELDS_MISSING,
        })
        setDirectPermission(tempPermissions)
    }

    return isComplete
}

const isRoleCustom = (roleValue: string) =>
    [CONFIG_APPROVER_ACTION.value, ARTIFACT_PROMOTER_ACTION.value].includes(roleValue)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseData(dataList: any[], entity: string, accessType?: string) {
    switch (entity) {
        case EntityTypes.DIRECT:
            if (accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                return dataList.filter(
                    (role) => role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && !isRoleCustom(role.value),
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

export const getWorkflowOptions = (appIdWorkflowNamesMapping: AppIdWorkflowNamesMapping['appIdWorkflowNamesMapping']) =>
    Object.entries(appIdWorkflowNamesMapping ?? {}).map(([jobName, jobWorkflows]) => ({
        label: jobName,
        options: jobWorkflows.map((workflow) => ({
            label: workflow,
            value: workflow,
        })),
    }))

export const getPrimaryRoleIndex = (multiRole: string[], excludedRoles: string[]): number => {
    const primaryRoleIndex = multiRole.findIndex((role) => !excludedRoles.includes(role))
    return primaryRoleIndex === -1 ? 0 : primaryRoleIndex
}
