import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import { DEFAULT_ENV } from '../../../../../../components/app/details/triggerView/Constants'
import { createClusterEnvGroup } from '../../../../../../components/common'
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../../../../../config'
import { DirectPermissionRow, EntityTypes } from '../userGroups/userGroups.types'

export const getNavLinksConfig = (serverMode: SERVER_MODE, superAdmin: boolean) =>
    [
        {
            tabName: 'devtron-apps',
            label: 'Devtron Apps',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
        {
            tabName: 'helm-apps',
            label: 'Helm Apps',
            isHidden: false,
        },
        {
            tabName: 'jobs',
            label: 'Jobs',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
        {
            tabName: 'kubernetes-objects',
            label: 'Kubernetes Resources',
            isHidden: !superAdmin,
        },
        {
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

export const getPermissionDetailRowClass = (accessType: ACCESS_TYPE_MAP) => {
    switch (accessType) {
        case ACCESS_TYPE_MAP.DEVTRON_APPS:
            return 'app-permission-detail__row--devtron-apps'
        case ACCESS_TYPE_MAP.HELM_APPS:
            return 'app-permission-detail__row--helm-apps'
        case ACCESS_TYPE_MAP.JOBS:
            return 'app-permission-detail__row--jobs'
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
                value: `#${cluster.clusterName}`,
                namespace: '',
                clusterName: '',
            },
            {
                label: `All existing environments in ${cluster.clusterName}`,
                value: `*${cluster.clusterName}`,
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

export const getEnvironmentOptions = (environmentsList, entity: DirectPermissionRow['permission']['entity']) => {
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
