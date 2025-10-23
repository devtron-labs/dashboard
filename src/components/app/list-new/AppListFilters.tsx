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
import ReactGA from 'react-ga4'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    ExportToCsv,
    ExportToCsvProps,
    GroupedFilterSelectPicker,
    GroupedFilterSelectPickerProps,
    Icon,
    InfrastructureManagementAppListType,
    SearchBar,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getDevtronAppListDataToExport } from './AppListService'
import { AppListFiltersProps, AppListUrlFilters, AppStatuses } from './AppListType'
import { APP_STATUS_FILTER_OPTIONS, APPLIST_EXPORT_HEADERS, TEMPLATE_TYPE_FILTER_OPTIONS } from './Constants'
import { getAppListFilters, getAppTabNameFromAppType, useFilterOptions } from './list.utils'

const AppListFilters = ({
    filterConfig,
    appListFiltersLoading,
    appCount,
    isArgoInstalled,
    isExternalArgo,
    isExternalFlux,
    appListFiltersResponse,
    showPulsatingDot,
    appListFiltersError,
    reloadAppListFilters,
    serverMode,
    handleSearch,
    getFormattedFilterValue,
    updateSearchParams,
    appType,
    namespaceListResponse,
    syncNow,
    lastSyncTimeString,
    showExportCsvButton,
    isDataSyncing,
}: AppListFiltersProps) => {
    const { appStatus, cluster, environment, namespace, project, templateType, searchKey } = filterConfig

    const { projectOptions, clusterOptions, environmentOptions, namespaceOptions } = useFilterOptions({
        appListFiltersResponse,
        namespaceListResponse,
        getFormattedFilterValue,
        isExternalArgo,
        isExternalFlux,
    })

    const getIsClusterOptionDisabled = (option: SelectPickerOptionType): boolean => {
        const clusterList = appListFiltersResponse?.isFullMode
            ? appListFiltersResponse?.appListFilters.result.clusters
            : appListFiltersResponse?.clusterList.result
        if (!clusterList || (!isExternalArgo && !isExternalFlux)) return false
        return clusterList.find((clusterItem) => clusterItem.id === +option.value)?.isVirtualCluster
    }

    const getIsAppStatusDisabled = (option: SelectPickerOptionType): boolean =>
        appType === InfrastructureManagementAppListType.HELM && option.label === AppStatuses.NOT_DEPLOYED

    const {
        selectedAppStatus,
        selectedProjects,
        selectedEnvironments,
        selectedClusters,
        selectedNamespaces,
        selectedTemplateTypes,
        clusterIdsCsv,
    } = useMemo(
        () => ({
            selectedAppStatus: appStatus.map((status) => ({ label: status, value: status })) || [],
            selectedProjects:
                project.map((team) => ({
                    label: getFormattedFilterValue(AppListUrlFilters.project, team),
                    value: team,
                })) || [],

            selectedEnvironments:
                environment.map((env) => ({
                    label: getFormattedFilterValue(AppListUrlFilters.environment, env),
                    value: env,
                })) || [],

            selectedClusters:
                cluster.map((clusterId) => ({
                    label: getFormattedFilterValue(AppListUrlFilters.cluster, clusterId),
                    value: clusterId,
                })) || [],

            selectedNamespaces:
                namespace.map((namespaceOption) => ({
                    label: getFormattedFilterValue(AppListUrlFilters.namespace, namespaceOption),
                    value: namespaceOption,
                })) || [],
            selectedTemplateTypes:
                templateType.map((templateTypeItem) => ({
                    label: templateTypeItem,
                    value: templateTypeItem,
                })) || [],
            clusterIdsCsv: cluster.join(),
        }),
        [filterConfig],
    )

    const appStatusFilters: typeof APP_STATUS_FILTER_OPTIONS = structuredClone(APP_STATUS_FILTER_OPTIONS)

    const handleUpdateFilters = (filterKey: AppListUrlFilters) => (selectedOptions: SelectPickerOptionType[]) => {
        ReactGA.event({ category: getAppTabNameFromAppType(appType), action: filterKey })
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    const appListFiltersSelectPickerMap: GroupedFilterSelectPickerProps<AppListUrlFilters>['filterSelectPickerPropsMap'] =
        {
            [AppListUrlFilters.appStatus]: {
                placeholder: 'App Status',
                inputId: 'app-list-app-status-select',
                options: appStatusFilters,
                appliedFilterOptions: selectedAppStatus,
                handleApplyFilter: handleUpdateFilters(AppListUrlFilters.appStatus),
                isDisabled: false,
                isLoading: false,
                isOptionDisabled: getIsAppStatusDisabled,
            },
            [AppListUrlFilters.project]: {
                placeholder: 'Project',
                inputId: 'app-list-project-select',
                options: projectOptions,
                appliedFilterOptions: selectedProjects,
                handleApplyFilter: handleUpdateFilters(AppListUrlFilters.project),
                isDisabled: appListFiltersLoading,
                isLoading: appListFiltersLoading,
                optionListError: appListFiltersError,
                reloadOptionList: reloadAppListFilters,
            },
            [AppListUrlFilters.environment]: {
                placeholder: 'Environment',
                inputId: 'app-list-environment-select',
                options: environmentOptions,
                appliedFilterOptions: selectedEnvironments,
                handleApplyFilter: handleUpdateFilters(AppListUrlFilters.environment),
                isDisabled: appListFiltersLoading || !!clusterIdsCsv,
                isLoading: appListFiltersLoading,
                optionListError: appListFiltersError,
                reloadOptionList: reloadAppListFilters,
            },
            [AppListUrlFilters.templateType]: {
                placeholder: 'Template Type',
                inputId: 'app-list-template-type-filter',
                options: TEMPLATE_TYPE_FILTER_OPTIONS,
                appliedFilterOptions: selectedTemplateTypes,
                handleApplyFilter: handleUpdateFilters(AppListUrlFilters.templateType),
                isDisabled: !clusterIdsCsv,
                isLoading: false,
            },
            [AppListUrlFilters.cluster]: {
                placeholder: 'Cluster',
                inputId: 'app-list-cluster-filter',
                options: clusterOptions,
                appliedFilterOptions: selectedClusters,
                isDisabled: !(isExternalArgo || isExternalFlux) && !!selectedEnvironments.length,
                isLoading: appListFiltersLoading,
                handleApplyFilter: handleUpdateFilters(AppListUrlFilters.cluster),
                optionListError: appListFiltersError,
                reloadOptionList: reloadAppListFilters,
                isOptionDisabled: getIsClusterOptionDisabled,
            },
            [AppListUrlFilters.namespace]: {
                placeholder: 'Namespace',
                inputId: 'app-list-namespace-filter',
                options: namespaceOptions,
                appliedFilterOptions: selectedNamespaces,
                isDisabled: appListFiltersLoading || !clusterIdsCsv,
                isLoading: appListFiltersLoading,
                handleApplyFilter: handleUpdateFilters(AppListUrlFilters.namespace),
                shouldMenuAlignRight: !showExportCsvButton,
                optionListError: appListFiltersError,
                reloadOptionList: reloadAppListFilters,
            },
        }

    const getExportToCsvApiPromise: ExportToCsvProps<(typeof APPLIST_EXPORT_HEADERS)[number]['key']>['apiPromise'] = ({
        signal,
    }) =>
        getDevtronAppListDataToExport(
            filterConfig,
            appListFiltersResponse?.appListFilters.result.environments,
            namespaceListResponse?.result,
            appListFiltersResponse?.appListFilters.result.clusters,
            appListFiltersResponse?.appListFilters.result.teams,
            appCount,
            signal,
        )

    const renderExportToCSV = () => {
        if (!showExportCsvButton) {
            return null
        }

        return (
            <ExportToCsv<(typeof APPLIST_EXPORT_HEADERS)[number]['key']>
                headers={APPLIST_EXPORT_HEADERS}
                apiPromise={getExportToCsvApiPromise}
                fileName="Devtron Apps"
                disabled={!appCount}
            />
        )
    }

    return (
        <div className="search-filter-section">
            <div className="flex left dc__gap-8">
                <SearchBar
                    containerClassName="w-250"
                    dataTestId="search-by-app-name"
                    initialSearchText={searchKey}
                    inputProps={{
                        placeholder: `${
                            appType === InfrastructureManagementAppListType.HELM
                                ? 'Search by app or chart name'
                                : 'Search by app name'
                        }`,
                    }}
                    handleEnter={handleSearch}
                    size={ComponentSizeType.medium}
                    keyboardShortcut="/"
                />
                <div className="dc__position-rel">
                    <GroupedFilterSelectPicker<AppListUrlFilters>
                        id="app-list-filters"
                        width={200}
                        isFilterApplied={
                            !!(
                                selectedAppStatus.length ||
                                selectedProjects.length ||
                                selectedEnvironments.length ||
                                selectedTemplateTypes.length ||
                                selectedClusters.length ||
                                selectedNamespaces.length
                            )
                        }
                        options={getAppListFilters({
                            clusterIdsCsv,
                            isExternalArgo,
                            isExternalFlux,
                            isArgoInstalled,
                            serverMode,
                            selectedEnvironments,
                        })}
                        filterSelectPickerPropsMap={appListFiltersSelectPickerMap}
                    />
                    {showPulsatingDot && <div className="dc__position-abs dc__pulsating-dot" />}
                </div>
            </div>

            <div className="flex dc__gap-8">
                {appType !== InfrastructureManagementAppListType.ARGO_CD &&
                    appType !== InfrastructureManagementAppListType.FLUX_CD &&
                    lastSyncTimeString &&
                    syncNow && (
                        <Button
                            dataTestId="sync-apps"
                            startIcon={<Icon name="ic-arrow-clockwise" color={null} />}
                            text={lastSyncTimeString}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.neutral}
                            onClick={syncNow}
                            disabled={isDataSyncing}
                            size={ComponentSizeType.medium}
                        />
                    )}
                {renderExportToCSV()}
            </div>
        </div>
    )
}

export default AppListFilters
