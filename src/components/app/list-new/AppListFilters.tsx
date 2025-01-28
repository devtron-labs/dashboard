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
    ComponentSizeType,
    FilterSelectPicker,
    SearchBar,
    SelectPickerOptionType,
    SERVER_MODE,
    Tooltip,
    useSuperAdmin,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactGA from 'react-ga4'
import { FILE_NAMES } from '@Components/common/ExportToCsv/constants'
import ExportToCsv from '@Components/common/ExportToCsv/ExportToCsv'
import { useMemo } from 'react'
import { APP_STATUS_FILTER_OPTIONS, SELECT_CLUSTER_TIPPY, TEMPLATE_TYPE_FILTER_OPTIONS } from './Constants'
import { AppListFiltersProps, AppListUrlFilters, AppStatuses } from './AppListType'
import { getDevtronAppListDataToExport } from './AppListService'
import { getAppTabNameFromAppType, useFilterOptions } from './list.utils'

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
}: AppListFiltersProps) => {
    const { isSuperAdmin } = useSuperAdmin()

    const { searchKey } = filterConfig

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
        appType === AppListConstants.AppType.HELM_APPS && option.label === AppStatuses.NOT_DEPLOYED

    const {
        selectedAppStatus,
        selectedProjects,
        selectedEnvironments,
        selectedClusters,
        selectedNamespaces,
        selectedTemplateTypes,
        clusterIdsCsv,
    } = useMemo(() => {
        const { appStatus, cluster, environment, namespace, project, templateType } = filterConfig

        return {
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
        }
    }, [filterConfig])

    const appStatusFilters: SelectPickerOptionType[] = structuredClone(APP_STATUS_FILTER_OPTIONS)

    const showExportCsvButton =
        isSuperAdmin && appType === AppListConstants.AppType.DEVTRON_APPS && serverMode !== SERVER_MODE.EA_ONLY

    const handleUpdateFilters = (filterKey: AppListUrlFilters) => (selectedOptions: SelectPickerOptionType[]) => {
        ReactGA.event({ category: getAppTabNameFromAppType(appType), action: filterKey })
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    return (
        <div className="search-filter-section">
            <SearchBar
                containerClassName="w-250"
                dataTestId="search-by-app-name"
                initialSearchText={searchKey}
                inputProps={{
                    placeholder: `${
                        appType === AppListConstants.AppType.HELM_APPS
                            ? 'Search by app or chart name'
                            : 'Search by app name'
                    }`,
                }}
                handleEnter={handleSearch}
                size={ComponentSizeType.medium}
            />
            <div className="flexbox dc__gap-8 dc__align-items-center">
                {!(isExternalArgo || isExternalFlux) && (
                    <>
                        {isArgoInstalled && (
                            <>
                                <FilterSelectPicker
                                    placeholder="App Status"
                                    inputId="app-list-app-status-select"
                                    options={appStatusFilters}
                                    appliedFilterOptions={selectedAppStatus}
                                    handleApplyFilter={handleUpdateFilters(AppListUrlFilters.appStatus)}
                                    isDisabled={false}
                                    isLoading={false}
                                    isOptionDisabled={getIsAppStatusDisabled}
                                />
                                <div className="dc__border-right h-16" />
                            </>
                        )}
                        <FilterSelectPicker
                            placeholder="Project"
                            inputId="app-list-project-select"
                            options={projectOptions}
                            appliedFilterOptions={selectedProjects}
                            handleApplyFilter={handleUpdateFilters(AppListUrlFilters.project)}
                            isDisabled={appListFiltersLoading}
                            isLoading={appListFiltersLoading}
                            optionListError={appListFiltersError}
                            reloadOptionList={reloadAppListFilters}
                        />
                        <div className="dc__border-right h-16" />
                        {serverMode === SERVER_MODE.FULL && (
                            <>
                                <Tooltip
                                    content="Remove cluster filters to use environment filter"
                                    alwaysShowTippyOnHover={!!clusterIdsCsv}
                                    wordBreak={false}
                                >
                                    <div>
                                        <FilterSelectPicker
                                            placeholder="Environment"
                                            inputId="app-list-environment-select"
                                            options={environmentOptions}
                                            appliedFilterOptions={selectedEnvironments}
                                            handleApplyFilter={handleUpdateFilters(AppListUrlFilters.environment)}
                                            isDisabled={appListFiltersLoading || !!clusterIdsCsv}
                                            isLoading={appListFiltersLoading}
                                            optionListError={appListFiltersError}
                                            reloadOptionList={reloadAppListFilters}
                                        />
                                    </div>
                                </Tooltip>
                                <div className="dc__border-right h-16" />
                            </>
                        )}
                    </>
                )}
                {isExternalFlux && (
                    <>
                        <Tooltip content={SELECT_CLUSTER_TIPPY} alwaysShowTippyOnHover={!clusterIdsCsv}>
                            <div>
                                <FilterSelectPicker
                                    placeholder="Template Type"
                                    inputId="app-list-template-type-filter"
                                    options={TEMPLATE_TYPE_FILTER_OPTIONS}
                                    appliedFilterOptions={selectedTemplateTypes}
                                    handleApplyFilter={handleUpdateFilters(AppListUrlFilters.templateType)}
                                    isDisabled={!clusterIdsCsv}
                                    isLoading={false}
                                />
                            </div>
                        </Tooltip>
                        <div className="dc__border-right h-16" />
                    </>
                )}
                <Tooltip
                    content="Remove environment filters to use cluster filter"
                    alwaysShowTippyOnHover={!(isExternalArgo || isExternalFlux) && !!selectedEnvironments.length}
                    wordBreak={false}
                >
                    <div className="flexbox dc__position-rel">
                        <FilterSelectPicker
                            placeholder="Cluster"
                            inputId="app-list-cluster-filter"
                            options={clusterOptions}
                            appliedFilterOptions={selectedClusters}
                            isDisabled={!(isExternalArgo || isExternalFlux) && !!selectedEnvironments.length}
                            isLoading={appListFiltersLoading}
                            handleApplyFilter={handleUpdateFilters(AppListUrlFilters.cluster)}
                            optionListError={appListFiltersError}
                            reloadOptionList={reloadAppListFilters}
                            isOptionDisabled={getIsClusterOptionDisabled}
                        />
                        {showPulsatingDot && <div className="dc__pulsating-dot dc__position-abs" />}
                    </div>
                </Tooltip>
                <Tooltip content={SELECT_CLUSTER_TIPPY} alwaysShowTippyOnHover={!clusterIdsCsv}>
                    <div>
                        <FilterSelectPicker
                            placeholder="Namespace"
                            inputId="app-list-namespace-filter"
                            options={namespaceOptions}
                            appliedFilterOptions={selectedNamespaces}
                            isDisabled={appListFiltersLoading || !clusterIdsCsv}
                            isLoading={appListFiltersLoading}
                            handleApplyFilter={handleUpdateFilters(AppListUrlFilters.namespace)}
                            shouldMenuAlignRight={!showExportCsvButton}
                            optionListError={appListFiltersError}
                            reloadOptionList={reloadAppListFilters}
                        />
                    </div>
                </Tooltip>
                {showExportCsvButton && (
                    <>
                        <div className="dc__border-right h-16" />
                        <ExportToCsv
                            apiPromise={() =>
                                getDevtronAppListDataToExport(
                                    filterConfig,
                                    appListFiltersResponse?.appListFilters.result.environments,
                                    namespaceListResponse?.result,
                                    appListFiltersResponse?.appListFilters.result.clusters,
                                    appListFiltersResponse?.appListFilters.result.teams,
                                    appCount,
                                )
                            }
                            fileName={FILE_NAMES.Apps}
                            disabled={!appCount}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default AppListFilters
