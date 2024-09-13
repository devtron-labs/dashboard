import {
    AppListConstants,
    ComponentSizeType,
    FilterSelectPicker,
    getUserRole,
    GroupedOptionsType,
    OptionType,
    SearchBar,
    SelectPickerOptionType,
    SERVER_MODE,
    stringComparatorBySortOrder,
    Teams,
    Tooltip,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { FILE_NAMES } from '@Components/common/ExportToCsv/constants'
import { useMemo } from 'react'
import { Cluster } from '@Services/service.types'
import ExportToCsv from '@Components/common/ExportToCsv/ExportToCsv'
import {
    APP_STATUS_FILTER_OPTIONS,
    APPS_WITH_NO_PROJECT_OPTION,
    SELECT_CLUSTER_TIPPY,
    TEMPLATE_TYPE_FILTER_OPTIONS,
} from './Constants'
import { AppListFiltersProps, AppListUrlFilters, AppStatuses } from './AppListType'
import { getDevtronAppListDataToExport } from './AppListService'

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
    const { appStatus, cluster, environment, namespace, project, templateType, searchKey } = filterConfig

    const clusterIdsCsv = cluster.join()

    const [, userRoleResponse] = useAsync(getUserRole, [])

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
            appListFiltersResponse?.appListFilters.result.environments.reduce((prev, curr) => {
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
                options: clusterItem.options,
            })) ?? [],
        [clusterGroupedEnvOptions],
    )

    const handleVirtualClusterFiltering = (clusterList: Cluster[]): Cluster[] => {
        if (!clusterList) return []
        if (isExternalArgo || isExternalFlux) {
            return clusterList.filter((clusterItem) => !clusterItem.isVirtualCluster)
        }
        return clusterList
    }

    const getClusterOptions = (clusterList: Cluster[]): SelectPickerOptionType[] =>
        handleVirtualClusterFiltering(clusterList).map((clusterItem) => ({
            label: clusterItem.cluster_name,
            value: String(clusterItem.id),
        }))

    const clusterOptions: SelectPickerOptionType[] = useMemo(
        () =>
            appListFiltersResponse?.isFullMode
                ? getClusterOptions(appListFiltersResponse?.appListFilters.result.clusters)
                : getClusterOptions(appListFiltersResponse?.clusterList.result),
        [appListFiltersResponse],
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

    const selectedAppStatus = appStatus.map((status) => ({ label: status, value: status })) || []

    const selectedProjects =
        project.map((team) => ({
            label: getFormattedFilterValue(AppListUrlFilters.project, team),
            value: team,
        })) || []

    const selectedEnvironments =
        environment.map((env) => ({
            label: getFormattedFilterValue(AppListUrlFilters.environment, env),
            value: env,
        })) || []

    const selectedClusters =
        cluster.map((clusterId) => ({
            label: getFormattedFilterValue(AppListUrlFilters.cluster, clusterId),
            value: clusterId,
        })) || []

    const selectedNamespaces =
        namespace.map((namespaceOption) => ({
            label: getFormattedFilterValue(AppListUrlFilters.namespace, namespaceOption),
            value: namespaceOption,
        })) || []

    const selectedTemplateTypes =
        templateType.map((templateTypeItem) => ({
            label: templateTypeItem,
            value: templateTypeItem,
        })) || []

    const appStatusFilters: SelectPickerOptionType[] =
        appType === AppListConstants.AppType.HELM_APPS
            ? structuredClone(APP_STATUS_FILTER_OPTIONS).filter((status) => status.label !== AppStatuses.NOT_DEPLOYED)
            : structuredClone(APP_STATUS_FILTER_OPTIONS)

    const showExportCsvButton =
        userRoleResponse?.result?.roles?.indexOf('role:super-admin___') !== -1 &&
        appType === AppListConstants.AppType.DEVTRON_APPS &&
        serverMode !== SERVER_MODE.EA_ONLY

    const handleUpdateFilters = (filterKey: AppListUrlFilters) => (selectedOptions: SelectPickerOptionType[]) => {
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
                    alwaysShowTippyOnHover={!!environment.length}
                    wordBreak={false}
                >
                    <div className="flexbox dc__position-rel">
                        <FilterSelectPicker
                            placeholder="Cluster"
                            inputId="app-list-cluster-filter"
                            options={clusterOptions}
                            appliedFilterOptions={selectedClusters}
                            isDisabled={!!environment.length}
                            isLoading={appListFiltersLoading}
                            handleApplyFilter={handleUpdateFilters(AppListUrlFilters.cluster)}
                            optionListError={appListFiltersError}
                            reloadOptionList={reloadAppListFilters}
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
