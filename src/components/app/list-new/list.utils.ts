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

import { useMemo } from 'react'
import { GroupBase } from 'react-select'

import {
    AppListConstants,
    GroupedFilterSelectPickerProps,
    GroupedOptionsType,
    InfrastructureManagementAppListType,
    OptionType,
    SelectPickerOptionType,
    SERVER_MODE,
    stringComparatorBySortOrder,
    Teams,
} from '@devtron-labs/devtron-fe-common-lib'

import ArgoCDAppIcon from '@Icons/ic-argocd-app.svg'
import FluxCDAppIcon from '@Icons/ic-fluxcd-app.svg'
import { Cluster } from '@Services/service.types'

import {
    AppListFilterMenuItemType,
    AppListUrlFilters,
    AppListUrlFiltersType,
    AppStatuses,
    AppStatusesDTO,
    GetAppListFiltersParams,
    useFilterOptionsProps,
} from './AppListType'
import { SELECT_CLUSTER_TIPPY } from './Constants'

export const getAppTabNameFromAppType = (appType: InfrastructureManagementAppListType) => {
    switch (appType) {
        case InfrastructureManagementAppListType.HELM:
            return AppListConstants.AppTabs.HELM_APPS
        case InfrastructureManagementAppListType.ARGO_CD:
            return AppListConstants.AppTabs.ARGO_APPS
        case InfrastructureManagementAppListType.FLUX_CD:
            return AppListConstants.AppTabs.FLUX_APPS
        default:
            return AppListConstants.AppTabs.DEVTRON_APPS
    }
}

export const renderIcon = (appType: InfrastructureManagementAppListType): string => {
    if (appType === InfrastructureManagementAppListType.FLUX_CD) {
        return FluxCDAppIcon
    }
    return ArgoCDAppIcon
}

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [AppListUrlFilters.appStatus]: searchParams.getAll(AppListUrlFilters.appStatus),
    [AppListUrlFilters.project]: searchParams.getAll(AppListUrlFilters.project),
    [AppListUrlFilters.environment]: searchParams.getAll(AppListUrlFilters.environment),
    [AppListUrlFilters.cluster]: searchParams.getAll(AppListUrlFilters.cluster),
    [AppListUrlFilters.namespace]: searchParams.getAll(AppListUrlFilters.namespace),
    [AppListUrlFilters.templateType]: searchParams.getAll(AppListUrlFilters.templateType),
})

export const getFormattedFilterLabel = (filterType: AppListUrlFilters) => {
    if (filterType === AppListUrlFilters.appStatus) {
        return 'App Status'
    }
    if (filterType === AppListUrlFilters.templateType) {
        return 'Template Type'
    }
    return null
}

export const getAppStatusFormattedValue = (filterValue: string) => {
    switch (filterValue) {
        case AppStatusesDTO.HIBERNATING:
            return AppStatuses.HIBERNATING
        case AppStatusesDTO.NOT_DEPLOYED:
            return AppStatuses.NOT_DEPLOYED
        default:
            return filterValue
    }
}

export const useFilterOptions = ({
    appListFiltersResponse,
    namespaceListResponse,
    getFormattedFilterValue,
    isExternalFlux,
    isExternalArgo,
}: useFilterOptionsProps) => {
    const getProjectOptions = (projectList: Teams[]): OptionType[] => {
        if (!projectList) {
            return []
        }
        return (
            projectList.map((team) => ({
                label: team.name,
                value: String(team.id),
            })) ?? []
        )
    }

    const projectOptions: GroupedOptionsType[] = useMemo(
        () => [
            {
                label: 'Projects',
                options: appListFiltersResponse
                    ? (appListFiltersResponse.isFullMode
                          ? getProjectOptions(appListFiltersResponse.appListFilters.result.teams)
                          : getProjectOptions(appListFiltersResponse.projectList.result)
                      ).sort((a, b) => stringComparatorBySortOrder(a.label, b.label))
                    : [],
            },
        ],
        [appListFiltersResponse],
    )

    const clusterGroupedEnvOptions: GroupedOptionsType[] = useMemo(
        () =>
            appListFiltersResponse?.appListFilters?.result.environments.reduce((prev, curr) => {
                if (!prev.find((clusterItem) => clusterItem.label === curr.cluster_id)) {
                    prev.push({ label: curr.cluster_id, options: [] })
                }
                prev.find((clusterItem) => clusterItem.label === curr.cluster_id).options.push({
                    label: curr.environment_name,
                    value: String(curr.id),
                })

                return prev
            }, []) ?? [],
        [appListFiltersResponse],
    )

    const environmentOptions: GroupedOptionsType[] = useMemo(
        () =>
            clusterGroupedEnvOptions?.map((clusterItem) => ({
                label: getFormattedFilterValue(AppListUrlFilters.cluster, clusterItem.label),
                options: clusterItem.options?.sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
            })) ?? [],
        [clusterGroupedEnvOptions],
    )

    const getClusterOptions = (clusterList: Cluster[]): SelectPickerOptionType[] =>
        (clusterList ?? [])
            .map((clusterItem) => ({
                label: clusterItem.cluster_name,
                value: String(clusterItem.id),
            }))
            .sort((a, b) => stringComparatorBySortOrder(a.label, b.label))

    const clusterOptions: GroupBase<SelectPickerOptionType>[] = useMemo(
        () => [
            {
                label: 'Cluster',
                options: appListFiltersResponse?.isFullMode
                    ? getClusterOptions(appListFiltersResponse?.appListFilters.result.clusters)
                    : getClusterOptions(appListFiltersResponse?.clusterList.result),
            },
        ],
        [appListFiltersResponse, isExternalArgo, isExternalFlux],
    )

    const namespaceOptions: GroupedOptionsType[] = useMemo(
        () =>
            namespaceListResponse?.result
                ?.map((clusterItem) => ({
                    label: clusterItem.clusterName,
                    options: clusterItem.environments
                        .filter((env) => !!env.namespace)
                        .sort((a, b) => stringComparatorBySortOrder(a.namespace, b.namespace))
                        .map((env) => ({
                            label: env.namespace,
                            value: `${clusterItem.clusterId}_${env.namespace}`,
                        })),
                }))
                .sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
        [namespaceListResponse],
    )

    return { projectOptions, clusterOptions, environmentOptions, namespaceOptions }
}

export const getFilterChipConfig = (
    filterConfig: AppListUrlFiltersType,
    appType: InfrastructureManagementAppListType,
): Partial<AppListUrlFiltersType> => {
    const { cluster, namespace, templateType } = filterConfig
    switch (appType) {
        case InfrastructureManagementAppListType.ARGO_CD:
            return { cluster, namespace }
        case InfrastructureManagementAppListType.FLUX_CD:
            return { cluster, namespace, templateType }
        default:
            return { ...filterConfig, templateType: [] }
    }
}

export const getAppListFilters = ({
    clusterIdsCsv,
    isExternalArgo,
    isExternalFlux,
    isArgoInstalled,
    serverMode,
    selectedEnvironments,
}: GetAppListFiltersParams): GroupedFilterSelectPickerProps<AppListUrlFilters>['options'] => [
    {
        items: [
            ...((!(isExternalArgo || isExternalFlux)
                ? [
                      ...((isArgoInstalled
                          ? [
                                {
                                    id: AppListUrlFilters.appStatus,
                                    label: 'App Status',
                                    startIcon: { name: 'ic-activity' },
                                },
                            ]
                          : []) as AppListFilterMenuItemType[]),
                      {
                          id: AppListUrlFilters.project,
                          label: 'Project',
                          startIcon: { name: 'ic-folder' },
                      },
                      ...((serverMode === SERVER_MODE.FULL
                          ? [
                                {
                                    id: AppListUrlFilters.environment,
                                    label: 'Environment',
                                    startIcon: { name: 'ic-environment' },
                                    isDisabled: !!clusterIdsCsv,
                                    tooltipProps: {
                                        content: clusterIdsCsv
                                            ? 'Remove cluster filters to use environment filter'
                                            : null,
                                    },
                                },
                            ]
                          : []) as AppListFilterMenuItemType[]),
                  ]
                : []) as AppListFilterMenuItemType[]),
            ...((isExternalFlux
                ? [
                      {
                          id: AppListUrlFilters.templateType,
                          label: 'Template Type',
                          startIcon: { name: 'ic-cube' },
                          isDisabled: !clusterIdsCsv,
                          tooltipProps: { content: !clusterIdsCsv ? SELECT_CLUSTER_TIPPY : null },
                      },
                  ]
                : []) as AppListFilterMenuItemType[]),
            {
                id: AppListUrlFilters.cluster,
                label: 'Cluster',
                startIcon: { name: 'ic-cluster' },
                isDisabled: !(isExternalArgo || isExternalFlux) && !!selectedEnvironments.length,
                tooltipProps: {
                    content:
                        !(isExternalArgo || isExternalFlux) && !!selectedEnvironments.length
                            ? 'Remove environment filters to use cluster filter'
                            : null,
                },
            },
            {
                id: AppListUrlFilters.namespace,
                label: 'Namespace',
                startIcon: { name: 'ic-namespace' },
                isDisabled: !clusterIdsCsv,
                tooltipProps: { content: !clusterIdsCsv ? SELECT_CLUSTER_TIPPY : null },
            },
        ],
    },
]
