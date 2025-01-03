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

import { OptionType, ACCESS_TYPE_MAP, EntityTypes, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import { OptionsOrGroups, GroupBase } from 'react-select'
import { DEFAULT_ENV } from '../../../../../../components/app/details/triggerView/Constants'
import { createClusterEnvGroup } from '../../../../../../components/common'
import { SELECT_ALL_VALUE, SERVER_MODE } from '../../../../../../config'
import { ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE, DirectPermissionFieldName } from './constants'
import { DirectPermissionRowProps } from './types'

export const getNavLinksConfig = (serverMode: SERVER_MODE, superAdmin: boolean) =>
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
            isHidden: !superAdmin,
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
