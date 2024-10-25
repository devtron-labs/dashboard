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

import {
    AppListConstants,
    GroupedOptionsType,
    OptionType,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    Teams,
} from '@devtron-labs/devtron-fe-common-lib'
import { useMemo } from 'react'
import { Cluster } from '@Services/service.types'
import { URLS } from '../../../config'
import ArgoCDAppIcon from '../../../assets/icons/ic-argocd-app.svg'
import FluxCDAppIcon from '../../../assets/icons/ic-fluxcd-app.svg'
import {
    AppListUrlFilters,
    AppListUrlFiltersType,
    AppStatuses,
    AppStatusesDTO,
    useFilterOptionsProps,
} from './AppListType'
import { APPS_WITH_NO_PROJECT_OPTION } from './Constants'

export const getChangeAppTabURL = (appTabType) => {
    switch (appTabType) {
        case AppListConstants.AppTabs.HELM_APPS:
            return URLS.HELM_APP_LIST
        case AppListConstants.AppTabs.ARGO_APPS:
            return URLS.ARGO_APP_LIST
        case AppListConstants.AppTabs.FLUX_APPS:
            return URLS.FLUX_APP_LIST
        default:
            return URLS.DEVTRON_APP_LIST
    }
}

export const getAppTabNameFromAppType = (appType: string) => {
    switch (appType) {
        case AppListConstants.AppType.HELM_APPS:
            return AppListConstants.AppTabs.HELM_APPS
        case AppListConstants.AppType.ARGO_APPS:
            return AppListConstants.AppTabs.ARGO_APPS
        case AppListConstants.AppType.FLUX_APPS:
            return AppListConstants.AppTabs.FLUX_APPS
        default:
            return AppListConstants.AppTabs.DEVTRON_APPS
    }
}

export const renderIcon = (appType: string): string => {
    if (appType === AppListConstants.AppType.FLUX_APPS) {
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
            { label: '', options: [APPS_WITH_NO_PROJECT_OPTION] },
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
        clusterList
            ?.map((clusterItem) => ({
                label: clusterItem.cluster_name,
                value: String(clusterItem.id),
            }))
            .sort((a, b) => stringComparatorBySortOrder(a.label, b.label))

    const clusterOptions: SelectPickerOptionType[] = useMemo(
        () =>
            appListFiltersResponse?.isFullMode
                ? getClusterOptions(appListFiltersResponse?.appListFilters.result.clusters)
                : getClusterOptions(appListFiltersResponse?.clusterList.result),
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
    appType: string,
): Partial<AppListUrlFiltersType> => {
    const { cluster, namespace, templateType } = filterConfig
    switch (appType) {
        case AppListConstants.AppType.ARGO_APPS:
            return { cluster, namespace }
        case AppListConstants.AppType.FLUX_APPS:
            return { cluster, namespace, templateType }
        default:
            return filterConfig
    }
}
