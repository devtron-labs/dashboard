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

import { GroupBase, Options, OptionsOrGroups } from 'react-select'

import {
    ACCESS_TYPE_MAP,
    DEFAULT_ENV,
    EntityTypes,
    getCommonSelectStyle,
    OptionType,
    RoleSelectorOptionType,
    SelectPickerOptionType,
    UserRoleConfig,
} from '@devtron-labs/devtron-fe-common-lib'

import { APIRoleFilter } from '@Pages/GlobalConfigurations/Authorization/types'

import { createClusterEnvGroup, importComponentFromFELibrary } from '../../../../../../components/common'
import { SELECT_ALL_VALUE, SERVER_MODE } from '../../../../../../config'
import {
    ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE,
    DirectPermissionFieldName,
    SELECT_ROLES_PLACEHOLDER,
} from './constants'
import { DirectPermissionRowProps, GetRoleConfigParams, RoleSelectorToggleConfig } from './types'

const getRoleConfig: (action: string, subAction: string, approver: boolean) => UserRoleConfig =
    importComponentFromFELibrary('getRoleConfig', null, 'function')

const getAdditionalRolesAccordingToAccess = importComponentFromFELibrary(
    'getAdditionalRolesAccordingToAccess',
    null,
    'function',
)

export const ALLOWED_ADDITIONAL_ROLES_MAP = importComponentFromFELibrary(
    'ALLOWED_ADDITIONAL_ROLES_MAP',
    null,
    'function',
)

const getAccessManagerRoles = importComponentFromFELibrary('getAccessManagerRoles', null, 'function')

export const getNavLinksConfig = (serverMode: SERVER_MODE, superAdmin: boolean, canManageAllAccess: boolean) =>
    [
        {
            // Access type is applicable for direct permissions only
            accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
            tabName: 'devtron-apps',
            label: 'Devtron Apps',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
        {
            accessType: ACCESS_TYPE_MAP.HELM_APPS,
            tabName: 'helm-apps',
            label: 'Helm Apps',
            isHidden: false,
        },
        {
            accessType: ACCESS_TYPE_MAP.JOBS,
            tabName: 'jobs',
            label: 'Jobs',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
        {
            accessType: null,
            tabName: 'kubernetes-objects',
            label: 'Kubernetes Resources',
            isHidden: !(superAdmin || canManageAllAccess),
        },
        {
            accessType: null,
            tabName: 'chart-groups',
            label: 'Chart Groups',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
    ] as const

export const getAppPermissionDetailConfig = (path: string, serverMode: SERVER_MODE) =>
    [
        {
            id: 'devtron-apps',
            url: `${path}/devtron-apps`,
            accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
            shouldRender: serverMode !== SERVER_MODE.EA_ONLY,
        },
        {
            id: 'helm-apps',
            url: `${path}/helm-apps`,
            accessType: ACCESS_TYPE_MAP.HELM_APPS,
            shouldRender: true,
        },
        {
            id: 'jobs',
            url: `${path}/jobs`,
            accessType: ACCESS_TYPE_MAP.JOBS,
            shouldRender: serverMode !== SERVER_MODE.EA_ONLY,
        },
    ] as const

export const getPermissionDetailRowClass = (accessType: ACCESS_TYPE_MAP, showStatus: boolean) => {
    const modifierClass = showStatus ? '--with-status' : ''

    switch (accessType) {
        case ACCESS_TYPE_MAP.DEVTRON_APPS:
            return `app-permission-detail__row-devtron-apps${modifierClass}`
        case ACCESS_TYPE_MAP.HELM_APPS:
            return `app-permission-detail__row-helm-apps${modifierClass}`
        case ACCESS_TYPE_MAP.JOBS:
            return `app-permission-detail__row-jobs${modifierClass}`
        default:
            throw new Error(`Invalid access type ${accessType}`)
    }
}

export const getEnvironmentClusterOptions = (envClustersList) =>
    envClustersList?.map((cluster) => ({
        label: cluster.clusterName,
        options: [
            {
                label: `All existing + future environments in ${cluster.clusterName}`,
                value: `${ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE}${cluster.clusterName}`,
                namespace: '',
                clusterName: '',
            },
            {
                label: `All existing environments in ${cluster.clusterName}`,
                value: `${SELECT_ALL_VALUE}${cluster.clusterName}`,
                namespace: '',
                clusterName: '',
            },
            ...(cluster.environments?.map((env) => ({
                label: env.environmentName,
                value: env.environmentIdentifier,
                namespace: env.namespace,
                clusterName: cluster.clusterName,
            })) ?? {}),
        ],
        isVirtualEnvironment: cluster?.isVirtualCluster,
    }))

export const getEnvironmentOptions = (environmentsList, entity: DirectPermissionRowProps['permission']['entity']) => {
    const envOptions = createClusterEnvGroup<OptionType & { isClusterCdActive: boolean }>(
        environmentsList,
        'cluster_name',
        'environment_name',
        'environmentIdentifier',
    )

    if (entity === EntityTypes.JOB) {
        const defaultEnv = {
            label: '',
            options: [
                {
                    label: DEFAULT_ENV,
                    value: DEFAULT_ENV,
                },
            ],
        }
        const filteredEnvOptions = envOptions.filter((_envOptions) => {
            const filteredOptions = _envOptions.options.filter((option) => option.isClusterCdActive)
            if (filteredOptions.length > 0) {
                // eslint-disable-next-line no-param-reassign
                _envOptions.options = filteredOptions
            }
            return filteredOptions.length > 0
        })
        return [defaultEnv, ...filteredEnvOptions]
    }
    return envOptions
}

export const getDisplayTextByName = (
    name: DirectPermissionFieldName,
    options: OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>>,
    selectedOptions: SelectPickerOptionType[],
) => {
    const selectedOptionsLength = selectedOptions?.length
    const optionsLength =
        options?.reduce(
            (acc, option) =>
                acc + (('options' in option && Array.isArray(option.options) ? option.options?.length : 1) ?? 0),
            0,
        ) ?? 0

    const count = selectedOptionsLength === optionsLength ? 'All' : selectedOptionsLength

    let Item
    if (name === DirectPermissionFieldName.apps) {
        Item = 'application'
    } else if (name === DirectPermissionFieldName.jobs) {
        Item = 'job'
    } else {
        Item = name
    }

    return `${count} ${Item}${selectedOptionsLength !== 1 ? 's' : ''}`
}

export const getEnvironmentDisplayText = (
    options: OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>>,
    selectedOptions: SelectPickerOptionType[],
) => {
    const selectedOptionsLength = selectedOptions.filter(
        (opt) =>
            opt.value &&
            !(opt.value as string).startsWith(ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE) &&
            !(opt.value as string).startsWith(SELECT_ALL_VALUE),
    ).length
    let count = ''
    // 2 represents all existing cluster option and all existing + future cluster option
    const totalEnvironments = options.reduce(
        (len, cluster) =>
            len + ('options' in cluster && Array.isArray(cluster.options) ? cluster.options.length - 2 : 1),
        0,
    )
    if (selectedOptionsLength === totalEnvironments) {
        count = 'All environments'
    } else {
        count = `${selectedOptionsLength} environment${selectedOptionsLength !== 1 ? 's' : ''}`
    }

    return count
}

export const getRoleConfigForRoleFilter = (roleFilter: APIRoleFilter, subAction: string): UserRoleConfig => {
    if (roleFilter.entity === EntityTypes.JOB || !ALLOWED_ADDITIONAL_ROLES_MAP) {
        return {
            baseRole: roleFilter.action,
            // Empty set in case of OSS
            additionalRoles: new Set(),
            accessManagerRoles: new Set(),
        }
    }

    const { action, approver } = roleFilter
    const roleConfig = getRoleConfig(action, subAction, approver)
    return roleConfig
}

export const getSelectedRolesText = (
    baseRole: string,
    roleConfig: UserRoleConfig,
    allowManageAllAccess: boolean,
): string => {
    const additionalRole = roleConfig.additionalRoles?.size > 0 ? 'Approver' : ''
    const accessManagerRole = !allowManageAllAccess && roleConfig.accessManagerRoles.size > 0 ? 'Access manager' : ''

    return [baseRole, additionalRole, accessManagerRole].filter(Boolean).join(', ') || SELECT_ROLES_PLACEHOLDER
}

export const getDefaultRolesToggleConfig = (roleConfig: UserRoleConfig): RoleSelectorToggleConfig => ({
    baseRole: !!roleConfig.baseRole || !!roleConfig.additionalRoles.size,
    accessManagerRoles: !!roleConfig.accessManagerRoles.size,
})

export const getRoleOptions = ({
    customRoles,
    accessType,
    showAccessRoles,
    showDeploymentApproverRole,
}: GetRoleConfigParams): Options<GroupBase<RoleSelectorOptionType>> => {
    const baseRoles: RoleSelectorOptionType[] = customRoles
        .filter(
            (role) =>
                role.accessType === accessType &&
                (ALLOWED_ADDITIONAL_ROLES_MAP ? !ALLOWED_ADDITIONAL_ROLES_MAP[role.roleName] : true),
        )
        .map((role) => ({
            label: role.roleDisplayName,
            value: role.roleName,
            description: role.roleDescription,
            roleType: 'baseRole',
        }))

    return [
        {
            label: 'Base Role',
            options: baseRoles,
        },
        ...(getAdditionalRolesAccordingToAccess
            ? [
                  {
                      label: 'Additional role',
                      options: getAdditionalRolesAccordingToAccess(customRoles, accessType, showDeploymentApproverRole),
                  },
              ]
            : []),
        ...(getAccessManagerRoles && showAccessRoles && accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
            ? [
                  {
                      label: 'Access Manager',
                      options: getAccessManagerRoles(customRoles),
                  },
              ]
            : []),
    ]
}

const commonSelectStyles = getCommonSelectStyle()

export const getRoleSelectorStyles = (error?: boolean) => ({
    container: (base, state) => ({
        ...commonSelectStyles.container(base, state),
    }),
    menu: (base, state) => ({
        ...commonSelectStyles.menu(base, state),
        overflow: 'hidden',
        marginBlock: '4px',
        border: '1px solid var(--N200)',
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.20)',
        minWidth: 240,
        maxHeight: 300,
        zIndex: 'var(--select-picker-menu-index)',
    }),
    menuList: (base) => ({
        ...base,
        padding: 4,
    }),
    dropdownIndicator: (base, state) => ({
        ...commonSelectStyles.dropdownIndicator(base, state),
        width: 16,
        height: 16,
        display: 'flex',
        alignItems: 'center',
        flexShrink: '0',
        padding: '0',
    }),
    groupHeading: (base) => ({
        ...base,
        padding: 0,
        margin: 0,
        color: 'var(--N900)',
        textTransform: 'none',
    }),
    option: (base, state) => ({
        ...commonSelectStyles.option(base, state),
        backgroundColor: state.isFocused ? 'var(--bg-secondary)' : 'var(--transparent)',
        padding: 0,
        borderRadius: 4,

        ':hover': {
            backgroundColor: 'var(--bg-hover)',
        },
    }),
    group: (base) => ({
        ...base,
        padding: 0,
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0',
    }),
    control: (base, state) => ({
        ...commonSelectStyles.control(base, state),
        height: '36px',
        minHeight: '36px',
        minWidth: '56px',
        border: `1px solid ${error ? 'var(--R500)' : 'var(--N200)'}`,
        padding: '5px 8px',
        gap: '6px',
        opacity: state.isDisabled ? 0.5 : 1,
        overflow: 'auto',
        alignItems: 'safe center',

        '&:hover': {
            borderColor: state.isDisabled ? 'var(--N200)' : `${error ? 'var(--R500)' : 'var(--N300)'}`,
        },

        '&:focus, &:focus-within': {
            borderColor: state.isDisabled ? 'var(--N200)' : 'var(--B500)',
            outline: 'none',
        },
    }),
    placeholder: (base, state) => ({
        ...commonSelectStyles.placeholder(base, state),
        color: state.isDisabled || state.children === SELECT_ROLES_PLACEHOLDER ? 'var(--N500)' : 'var(--N900)',
    }),
})
