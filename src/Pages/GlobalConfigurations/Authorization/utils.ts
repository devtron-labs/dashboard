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
    ACCESS_TYPE_MAP,
    ZERO_TIME_STRING,
    EntityTypes,
    CustomRoleAndMeta,
    CustomRoles,
    MetaPossibleRoles,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    ActionTypes,
    UserRoleConfig,
} from '@devtron-labs/devtron-fe-common-lib'
import { GroupBase } from 'react-select'
import { Moment12HourFormat, REQUIRED_FIELDS_MISSING, SELECT_ALL_VALUE, SERVER_MODE } from '../../../config'
import {
    APIRoleFilter,
    APIRoleFilterDto,
    CreateUserPermissionPayloadParams,
    PermissionGroup,
    PermissionGroupDto,
    User,
    UserCreateOrUpdateParamsType,
    UserDto,
} from './types'
import { LAST_LOGIN_TIME_NULL_STATE } from './UserPermissions/constants'
import { useAuthorizationBulkSelection } from './Shared/components/BulkSelection'
import { PermissionType, ViewChartGroupPermission, DEFAULT_ACCESS_TYPE_TO_ERROR_MAP } from './constants'
import { AppIdWorkflowNamesMapping } from '../../../services/service.types'
import { ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE } from './Shared/components/AppPermissions/constants'
import { importComponentFromFELibrary } from '../../../components/common'
import { getFormattedTimeToLive, getParsedUserGroupList } from './libUtils'
import {
    AccessTypeToErrorMapType,
    PermissionConfigurationFormContext,
} from './Shared/components/PermissionConfigurationForm/types'

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

const getPermissionActionValue: (roleConfig: UserRoleConfig) => string = importComponentFromFELibrary(
    'getPermissionActionValue',
    null,
    'function',
)

const DEPLOYMENT_APPROVER_ROLE_VALUE = importComponentFromFELibrary('DEPLOYMENT_APPROVER_ROLE_VALUE', null, 'function')

const getKeyForRoleFilter = ({ entity, team, environment, accessType, entityName, workflow }: APIRoleFilterDto) =>
    `${entity}${accessType}${team}${environment}${entityName}${workflow}`

const getRoleFiltersMap = (roleFilters: APIRoleFilterDto[]) =>
    roleFilters?.reduce<Record<string, true>>((agg, curr) => {
        const key = getKeyForRoleFilter(curr)
        // eslint-disable-next-line no-param-reassign
        agg[key] = true
        return agg
    }, {})

const getAccessRoleMap = (accessRoleFilters: APIRoleFilterDto[]) =>
    accessRoleFilters?.reduce<Record<string, string>>((agg, curr) => {
        const key = getKeyForRoleFilter(curr)
        // eslint-disable-next-line no-param-reassign
        agg[key] = curr.subAction
        return agg
    }, {})

const transformRoleFilters = (
    roleFilters: APIRoleFilterDto[],
    accessRoleFilters?: APIRoleFilterDto[],
): APIRoleFilter[] => {
    const accessRoleMap = getAccessRoleMap(accessRoleFilters)
    const roleFiltersMap = accessRoleFilters ? getRoleFiltersMap(roleFilters) : {}

    const parsedRoleFilters =
        roleFilters?.map(
            ({
                status: roleFilterStatus,
                timeoutWindowExpression: roleFilterTimeoutWindowExpression,
                ...roleFilter
            }) => {
                const roleFilterTimeToLive = getFormattedTimeToLive(roleFilterTimeoutWindowExpression)
                const { entity, team, environment, accessType, entityName, workflow } = roleFilter
                const accessMapKey = `${entity}${accessType}${team}${environment}${entityName}${workflow}`
                const accessMapVal = accessRoleMap?.[accessMapKey]

                return {
                    ...roleFilter,
                    status: getUserStatus(roleFilterStatus, roleFilterTimeToLive),
                    timeToLive: roleFilterTimeToLive,
                    ...(accessRoleFilters && accessMapVal ? { subAction: accessMapVal } : {}),
                }
            },
        ) ?? []

    if (accessRoleFilters) {
        accessRoleFilters.forEach((accessRole) => {
            const roleFilterKey = getKeyForRoleFilter(accessRole)

            // this means accessRoleFilter has no corresponding roleFilter
            // i.e. permission only has access manager role and not any base role or additional roles
            if (!roleFiltersMap[roleFilterKey]) {
                const roleFilterTimeToLive = getFormattedTimeToLive(accessRole.timeoutWindowExpression)

                parsedRoleFilters.push({
                    ...accessRole,
                    action: '',
                    status: getUserStatus(accessRole.status, roleFilterTimeToLive),
                    timeToLive: roleFilterTimeToLive,
                })
            }
        })
    }

    return parsedRoleFilters
}

export const transformUserResponse = (_user: UserDto): User => {
    const {
        lastLoginTime,
        timeoutWindowExpression,
        email_id: emailId,
        userStatus,
        userRoleGroups,
        roleFilters,
        accessRoleFilters,
        userGroups,
        isDeleted,
        createdOn,
        updatedOn,
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
        roleFilters: transformRoleFilters(roleFilters, accessRoleFilters),
        userGroups: getParsedUserGroupList(userGroups),
        createdOn: createdOn && createdOn !== ZERO_TIME_STRING ? moment(createdOn).format(Moment12HourFormat) : '',
        updatedOn: updatedOn && updatedOn !== ZERO_TIME_STRING ? moment(updatedOn).format(Moment12HourFormat) : '',
        isDeleted: isDeleted ?? false,
    }
}

export const transformPermissionGroupResponse = (_permissionGroup: PermissionGroupDto): PermissionGroup => {
    const { roleFilters, accessRoleFilters, ...permissionGroup } = _permissionGroup

    return {
        ...permissionGroup,
        roleFilters: transformRoleFilters(roleFilters, accessRoleFilters),
    }
}

export const getRoleNameToValueMap = (roleList: CustomRoles[]) =>
    roleList.reduce<MetaPossibleRoles>((agg, curr) => {
        // eslint-disable-next-line no-param-reassign
        agg[curr.roleName] = {
            value: curr.roleDisplayName,
            description: curr.roleDescription,
        }
        return agg
    }, {})

export const getMetaPossibleRoles = (customRoles: CustomRoles[]): CustomRoleAndMeta => {
    const filteredDevtronRoles = customRoles.filter((role) => role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS)
    const filteredClusterRoles = customRoles.filter((role) => role.entity === EntityTypes.CLUSTER)

    const possibleRolesMetaForDevtron = getRoleNameToValueMap(filteredDevtronRoles)
    const possibleJobRoles = customRoles
        .filter((role) => role.entity === EntityTypes.JOB)
        .map((jobRole) => ({
            label: jobRole.roleDisplayName,
            value: jobRole.roleName,
            description: jobRole.roleDescription,
        }))
    const possibleRolesMetaForCluster = getRoleNameToValueMap(filteredClusterRoles)

    return {
        customRoles,
        possibleRolesMetaForDevtron,
        possibleJobRoles,
        possibleRolesMetaForCluster,
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
            role: customRoles.possibleRolesMetaForDevtron[roleFilter.action]?.value || '-',
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

const getCommaSeparatedNamespaceList = (namespaces: OptionType[]) => {
    if (namespaces.some((el) => el.value === SELECT_ALL_VALUE)) {
        return ''
    }
    return namespaces.map((el) => el.value).join(',')
}

const getRoleAndAccessFiltersFromDirectPermission = ({
    directPermission,
    canManageAllAccess,
}: Pick<CreateUserPermissionPayloadParams, 'directPermission' | 'canManageAllAccess'>): {
    roleFilters: APIRoleFilter[]
    accessRoleFilters: APIRoleFilterDto[]
} => {
    const roleFilters = []
    const accessRoleFilters = []

    directPermission.forEach((permission) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { roleConfig, roleConfigError, workflowError, entityNameError, environmentError, ...restPermission } =
            permission

        const commonPermissions = {
            ...restPermission,
            team: permission.team.value,
            environment: getSelectedEnvironments(permission),
            entityName: getSelectedPermissionValues(permission.entityName),
            entity: permission.entity,
            ...(permission.entity === EntityTypes.JOB && {
                workflow: permission.workflow?.length ? getSelectedPermissionValues(permission.workflow) : '',
            }),
        }

        if (!canManageAllAccess && permission.roleConfig.accessManagerRoles.size > 0) {
            const accessRole = {
                ...commonPermissions,
                action: 'accessManager',
                subAction: Array.from(permission.roleConfig.accessManagerRoles).join(','),
            }
            accessRoleFilters.push(accessRole)
        }
        if (permission.roleConfig.baseRole || permission.roleConfig.additionalRoles.size > 0) {
            const role = {
                ...commonPermissions,
                // approver is true if deploymentApprover role is given
                ...(DEPLOYMENT_APPROVER_ROLE_VALUE
                    ? { approver: roleConfig.additionalRoles.has(DEPLOYMENT_APPROVER_ROLE_VALUE) }
                    : {}),
                // if fe lib is available get string for base and additional roles otherwise only send base role
                action: !getPermissionActionValue
                    ? permission.roleConfig.baseRole
                    : getPermissionActionValue(permission.roleConfig),
            }
            roleFilters.push(role)
        }
    })

    return { roleFilters, accessRoleFilters }
}

export const getRolesAndAccessRoles = ({
    directPermission,
    k8sPermission,
    chartPermission,
    serverMode,
    canManageAllAccess,
}: Pick<
    CreateUserPermissionPayloadParams,
    'chartPermission' | 'directPermission' | 'serverMode' | 'k8sPermission' | 'canManageAllAccess'
>) => {
    const filteredDirectPermissions = directPermission.filter(
        (permission) => permission.team?.value && permission.environment.length && permission.entityName.length,
    )
    const { roleFilters: directRoleFilters, accessRoleFilters } = getRoleAndAccessFiltersFromDirectPermission({
        directPermission: filteredDirectPermissions,
        canManageAllAccess,
    })
    const roleFilters: UserCreateOrUpdateParamsType['roleFilters'] = [
        ...directRoleFilters,
        ...k8sPermission.map((permission) => ({
            ...permission,
            entity: EntityTypes.CLUSTER as APIRoleFilter['entity'],
            action: permission.action.value,
            cluster: permission.cluster.label,
            group: permission.group.value === SELECT_ALL_VALUE ? '' : permission.group.value,
            kind: permission.kind.value === SELECT_ALL_VALUE ? '' : permission.kind.label,
            namespace: getCommaSeparatedNamespaceList(permission.namespace),
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

    return { roleFilters, accessRoleFilters }
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
    canManageAllAccess,
}: CreateUserPermissionPayloadParams): UserCreateOrUpdateParamsType => {
    const { roleFilters, accessRoleFilters } = getRolesAndAccessRoles({
        directPermission,
        k8sPermission,
        chartPermission,
        serverMode,
        canManageAllAccess,
    })

    return {
        // ID 0 denotes create operation
        id: id || 0,
        emailId: userIdentifier,
        userRoleGroups,
        superAdmin: getIsSuperAdminPermission(permissionType),
        userStatus,
        timeToLive,
        roleFilters,
        userGroups,
        ...(accessRoleFilters.length ? { accessRoleFilters } : {}),
        canManageAllAccess,
    }
}

export const validateDirectPermissionForm = (
    directPermission: PermissionConfigurationFormContext['directPermission'],
    setDirectPermission: PermissionConfigurationFormContext['setDirectPermission'],
    showErrorToast: boolean = true,
): {
    isValid: boolean
    accessTypeToErrorMap: AccessTypeToErrorMapType
} => {
    const accessTypeToErrorMap: Record<
        PermissionConfigurationFormContext['directPermission'][number]['accessType'],
        boolean
    > = structuredClone(DEFAULT_ACCESS_TYPE_TO_ERROR_MAP)

    const tempPermissions = directPermission.map<PermissionConfigurationFormContext['directPermission'][number]>(
        (permission) => {
            let isErrorInCurrentItem = false
            const updatedPermission = structuredClone(permission)

            if (updatedPermission.team) {
                if (updatedPermission.entityName.length === 0) {
                    isErrorInCurrentItem = true
                    updatedPermission.entityNameError = `${updatedPermission.entity === EntityTypes.JOB ? 'Jobs' : 'Applications'} are mandatory`
                }
                if (updatedPermission.environment.length === 0) {
                    isErrorInCurrentItem = true
                    updatedPermission.environmentError = 'Environments are mandatory'
                }
                if (updatedPermission.entity === EntityTypes.JOB && updatedPermission.workflow?.length === 0) {
                    isErrorInCurrentItem = true
                    updatedPermission.workflowError = 'Workflows are mandatory'
                }
                if (updatedPermission.roleConfigError) {
                    isErrorInCurrentItem = true
                }
            }

            if (isErrorInCurrentItem) {
                accessTypeToErrorMap[updatedPermission.accessType] = isErrorInCurrentItem
            }

            return updatedPermission
        },
        [],
    )

    const isFormValid = Object.values(accessTypeToErrorMap).every((val) => !val)

    if (!isFormValid && showErrorToast) {
        ToastManager.showToast({
            variant: ToastVariantType.error,
            description: REQUIRED_FIELDS_MISSING,
        })
        setDirectPermission(tempPermissions)
    }

    return { isValid: isFormValid, accessTypeToErrorMap }
}

export const getWorkflowOptions = (
    appIdWorkflowNamesMapping: AppIdWorkflowNamesMapping['appIdWorkflowNamesMapping'],
): GroupBase<SelectPickerOptionType<string>>[] =>
    Object.entries(appIdWorkflowNamesMapping ?? {})
        .map(([jobName, jobWorkflows]) => ({
            label: jobName,
            options: jobWorkflows
                .map((workflow) => ({
                    label: workflow,
                    value: workflow,
                }))
                .sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
        }))
        .sort((a, b) => stringComparatorBySortOrder(a.label, b.label))
