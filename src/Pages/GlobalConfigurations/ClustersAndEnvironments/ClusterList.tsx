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

import { useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuItemType,
    BASE_ROUTES,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ClusterMap,
    ComponentSizeType,
    ErrorScreenManager,
    ErrorScreenNotAuthorized,
    FiltersTypeEnum,
    GenericEmptyState,
    GenericFilterEmptyState,
    getDetailedClusterList,
    getSelectPickerOptionByValue,
    Icon,
    numberComparatorBySortOrder,
    OptionType,
    PaginationEnum,
    ROUTER_URLS,
    SearchBar,
    SegmentedControl,
    SelectPicker,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    Table,
    TableColumnType,
    useAsync,
    useMainContext,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import NoClusterImg from '@Images/no-cluster-empty-state.png'
import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'
import AddClusterButton from '@Pages/Shared/AddEditCluster/AddClusterButton'

import { getEnvironmentList } from './cluster.service'
import {
    ClusterEnvFilterType,
    ClusterEnvTabs,
    ClusterListFields,
    ClusterRowData,
    ClusterTableProps,
    Environment,
    EnvListSortableKeys,
} from './cluster.type'
import { parseClusterEnvSearchParams } from './cluster.util'
import {
    AddEnvironment,
    AddEnvironmentFromClusterName,
    ClusterEnvLoader,
    ClusterListCellComponent,
    DeleteCluster,
    EditCluster,
    HibernationRulesModalWrapper,
    PodSpreadModalWrapper,
} from './ClusterList.components'
import { ALL_CLUSTER_VALUE } from './constants'
import EnvironmentList from './EnvironmentList'

const ManageCategories = importComponentFromFELibrary('ManageCategories', null, 'function')
const ManageCategoryButton = importComponentFromFELibrary('ManageCategoryButton', null, 'function')
const PodSpreadModal = importComponentFromFELibrary('PodSpreadModal', null, 'function')
const HibernationRulesModal = importComponentFromFELibrary('HibernationRulesModal', null, 'function')

const ClusterList = () => {
    const { isSuperAdmin } = useMainContext()
    const isK8sClient = window._env_.K8S_CLIENT

    const navigate = useNavigate()
    const { search } = useLocation()

    const {
        searchKey,
        sortBy,
        sortOrder,
        selectedTab,
        clusterId: filterClusterId,
        updateSearchParams,
        handleSearch,
        handleSorting,
    } = useUrlFilters<EnvListSortableKeys, ClusterEnvFilterType>({
        parseSearchParams: parseClusterEnvSearchParams,
        initialSortKey: EnvListSortableKeys.ENV_NAME,
    })

    const [clusterListLoading, clusterListResult, clusterListError, reloadClusterList] = useAsync(
        getDetailedClusterList,
        [],
        isSuperAdmin,
    )

    const [envListLoading, envListResult, envListError, reloadEnvironments] = useAsync(
        getEnvironmentList,
        [],
        isSuperAdmin && !isK8sClient,
    )

    const [showUnmappedEnvs, setShowUnmappedEnvs] = useState(false)

    const clusterCount = clusterListResult?.length ?? 0
    const clusterIdVsEnvMap: Record<number, Environment[]> = useMemo(
        () =>
            (envListResult ?? []).reduce<Record<number, Environment[]>>((agg, curr) => {
                const { clusterId } = curr
                if (!agg[clusterId]) {
                    // eslint-disable-next-line no-param-reassign
                    agg[clusterId] = []
                }
                agg[clusterId].push(curr)
                return agg
            }, {}),
        [envListResult],
    )

    const clusterFilterOptions = useMemo(
        () => [
            { label: 'All Clusters', value: ALL_CLUSTER_VALUE },
            ...(clusterListResult ?? []).map(({ clusterName, clusterId }) => ({
                label: clusterName,
                value: `${clusterId}`,
            })),
        ],
        [clusterListResult],
    )

    const filteredClusterList = useMemo(
        () => (clusterListResult ?? []).filter(({ clusterName }) => clusterName.toLowerCase().includes(searchKey)),
        [clusterListResult, searchKey],
    )

    const {
        tableColumns,
        tableRows,
    }: {
        tableColumns: ClusterTableProps['columns']
        tableRows: ClusterTableProps['rows']
    } = useMemo(
        () => ({
            tableColumns: [
                {
                    field: ClusterListFields.ICON,
                    label: '',
                    size: { fixed: 24 },
                    CellComponent: ClusterListCellComponent,
                },
                {
                    field: ClusterListFields.CLUSTER_NAME,
                    label: 'CLUSTER',
                    size: { fixed: 200 },
                    isSortable: true,
                    comparator: stringComparatorBySortOrder,
                    CellComponent: ClusterListCellComponent,
                },
                ...(isK8sClient
                    ? []
                    : [
                          {
                              field: ClusterListFields.ENV_COUNT,
                              label: 'ENVIRONMENTS',
                              size: { fixed: 150 },
                              isSortable: true,
                              comparator: numberComparatorBySortOrder,
                              CellComponent: ClusterListCellComponent,
                          } as TableColumnType<ClusterRowData, FiltersTypeEnum.STATE, {}>,
                      ]),
                {
                    field: ClusterListFields.CLUSTER_TYPE,
                    label: 'TYPE',
                    size: { fixed: 100 },
                    isSortable: true,
                    comparator: stringComparatorBySortOrder,
                    CellComponent: ClusterListCellComponent,
                },
                ...(ManageCategories
                    ? [
                          {
                              field: ClusterListFields.CLUSTER_CATEGORY,
                              label: 'CATEGORY',
                              size: { fixed: 150 },
                              isSortable: true,
                              comparator: stringComparatorBySortOrder,
                              CellComponent: ClusterListCellComponent,
                          } as TableColumnType<ClusterRowData, FiltersTypeEnum.STATE, {}>,
                      ]
                    : []),
                {
                    field: ClusterListFields.SERVER_URL,
                    label: 'SERVER URL',
                    size: null,
                    CellComponent: ClusterListCellComponent,
                },
                {
                    field: ClusterListFields.ACTIONS,
                    label: '',
                    size: { fixed: 90 },
                    CellComponent: ClusterListCellComponent,
                },
            ],
            tableRows: filteredClusterList.map(
                ({ clusterId, clusterName, isProd, category, serverUrl, isVirtualCluster, status }) => {
                    const envCount = clusterIdVsEnvMap[clusterId]?.length
                    return {
                        id: `${clusterName}-${clusterId}`,
                        data: {
                            clusterId,
                            clusterName,
                            clusterType: isProd ? 'Production' : 'Non Production',
                            serverUrl,
                            envCount: envCount ?? 0,
                            clusterCategory: (category?.label as string) ?? '',
                            isVirtualCluster,
                            status,
                        },
                    }
                },
            ),
        }),
        [filteredClusterList, clusterIdVsEnvMap],
    )

    const isEnvironmentsView = selectedTab === ClusterEnvTabs.ENVIRONMENTS
    const isClusterEnvListLoading = clusterListLoading || envListLoading

    const clearSearch = () => {
        handleSearch('')
    }

    const handleReload = () => {
        reloadClusterList()
        reloadEnvironments()
    }

    // Early return for non super admin users
    if (!isK8sClient && !isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    const handleToggleShowNamespaces = () => {
        setShowUnmappedEnvs((prev) => !prev)
    }

    const handleActionMenuClick = (item: ActionMenuItemType) => {
        switch (item.id) {
            case 'show-unmapped-namespace':
                handleToggleShowNamespaces()
                break
            default:
                break
        }
    }

    const handleChangeTab = (selectedSegment: OptionType<ClusterEnvTabs>) => {
        updateSearchParams({ selectedTab: selectedSegment.value, clusterId: null })
        if (searchKey) {
            clearSearch()
        }
        if (showUnmappedEnvs) {
            setShowUnmappedEnvs(false)
        }
    }

    const handleChangeClusterFilter = (selectedOption: SelectPickerOptionType<string>) => {
        updateSearchParams({ clusterId: selectedOption.value === ALL_CLUSTER_VALUE ? null : selectedOption.value })
    }

    const handleRedirectToClusterList = () => {
        navigate({
            pathname: ROUTER_URLS.GLOBAL_CONFIG_CLUSTER_ENV,
            search,
        })
    }

    const renderList = () => {
        if (isClusterEnvListLoading) {
            return <ClusterEnvLoader />
        }

        if (clusterListError || envListError) {
            return <ErrorScreenManager code={clusterListError?.code ?? envListError.code} reload={handleReload} />
        }

        if (isEnvironmentsView) {
            const allEnvsList = Object.values(clusterIdVsEnvMap).flat()

            // In case no cluster is selected on env list page and no env is found, show global empty state
            if (!filterClusterId && allEnvsList.filter((env) => env.environmentName.includes(searchKey)).length === 0) {
                return <GenericFilterEmptyState handleClearFilters={clearSearch} />
            }

            return (
                <EnvironmentList
                    clusterIdVsEnvMap={clusterIdVsEnvMap}
                    clusterList={clusterListResult ?? []}
                    showUnmappedEnvs={showUnmappedEnvs}
                    filterClusterId={filterClusterId}
                    filterConfig={{ searchKey, sortBy, sortOrder }}
                    handleSorting={handleSorting}
                    isLoading={isClusterEnvListLoading}
                    reloadEnvironments={reloadEnvironments}
                />
            )
        }

        if (searchKey && !filteredClusterList.length) {
            return <GenericFilterEmptyState handleClearFilters={clearSearch} />
        }

        return (
            <>
                <ClusterMap isLoading={isClusterEnvListLoading} filteredList={filteredClusterList} />
                <div className="cluster-table-wrapper">
                    <Table<ClusterRowData, FiltersTypeEnum.STATE, {}>
                        id="table__cluster-list"
                        columns={tableColumns}
                        rows={tableRows}
                        filtersVariant={FiltersTypeEnum.STATE}
                        paginationVariant={PaginationEnum.NOT_PAGINATED}
                        emptyStateConfig={null}
                        filter={() => true}
                        additionalFilterProps={{
                            initialSortKey: 'clusterName',
                        }}
                    />
                </div>
            </>
        )
    }

    const renderAddClusterButton = () => (
        <AddClusterButton clusterCount={clusterCount} handleReloadClusterList={reloadClusterList} />
    )

    if (clusterListResult && !clusterListResult.length) {
        return (
            <GenericEmptyState
                title="Manage Clusters and Environments"
                subTitle="It looks like you haven't set up any Kubernetes clusters yet. Start by adding your first cluster and environment."
                isButtonAvailable
                renderButton={renderAddClusterButton}
                image={NoClusterImg}
            />
        )
    }

    return (
        <div className="flexbox-col h-100">
            <div className="flexbox-col bg__primary flex-grow-1">
                {/* Header */}
                <div className="flex p-16 dc__content-space">
                    <div className="flex dc__gap-8">
                        <SegmentedControl
                            name="cluster-env-view-toggle"
                            segments={[
                                { label: 'Clusters', value: ClusterEnvTabs.CLUSTERS },
                                ...(isK8sClient ? [] : [{ label: 'Environments', value: ClusterEnvTabs.ENVIRONMENTS }]),
                            ]}
                            value={selectedTab ?? ClusterEnvTabs.CLUSTERS}
                            onChange={handleChangeTab}
                            disabled={isClusterEnvListLoading}
                        />
                        {isEnvironmentsView && (
                            <SelectPicker
                                inputId="cluster-filter"
                                placeholder="Cluster"
                                options={clusterFilterOptions}
                                isDisabled={clusterListLoading}
                                isLoading={clusterListLoading}
                                onChange={handleChangeClusterFilter}
                                value={getSelectPickerOptionByValue(
                                    clusterFilterOptions,
                                    `${filterClusterId ?? ALL_CLUSTER_VALUE}`,
                                )}
                            />
                        )}
                    </div>
                    <div className="flex dc__gap-8">
                        <SearchBar
                            containerClassName="w-250"
                            dataTestId="search-cluster-env"
                            initialSearchText={searchKey}
                            inputProps={{
                                placeholder: isEnvironmentsView ? 'Search environment' : 'Search cluster',
                            }}
                            handleEnter={handleSearch}
                            size={ComponentSizeType.medium}
                            keyboardShortcut="/"
                        />
                        {ManageCategoryButton && <ManageCategoryButton search={search} />}
                        {isEnvironmentsView ? (
                            <Button
                                dataTestId="add-environment-button"
                                linkProps={{
                                    to: {
                                        pathname: `${ROUTER_URLS.GLOBAL_CONFIG_CLUSTER_ENV}${URLS.CREATE_ENVIRONMENT}`,
                                        search,
                                    },
                                }}
                                component={ButtonComponentType.link}
                                startIcon={<Icon name="ic-add" color={null} />}
                                size={ComponentSizeType.medium}
                                text="Add Environment"
                            />
                        ) : (
                            renderAddClusterButton()
                        )}
                        {isEnvironmentsView && (
                            <ActionMenu
                                id="additional-options-action-menu"
                                buttonProps={{
                                    icon: <Icon name="ic-more-vertical" color={null} />,
                                    ariaLabel: 'additional-options',
                                    dataTestId: 'additional-options',
                                    showAriaLabelInTippy: false,
                                    style: ButtonStyleType.neutral,
                                    variant: ButtonVariantType.secondary,
                                    size: ComponentSizeType.medium,
                                }}
                                options={[
                                    {
                                        items: [
                                            {
                                                id: 'show-unmapped-namespace',
                                                label: 'Show unmapped namespaces',
                                                description: 'Display namespaces not mapped to any environment',
                                                trailingItem: {
                                                    config: {
                                                        onChange: handleToggleShowNamespaces,
                                                        name: 'unmapped-env-toggle',
                                                        ariaLabel: 'unmapped-env-toggle',
                                                        isChecked: showUnmappedEnvs,
                                                    },
                                                    type: 'switch',
                                                },
                                            },
                                        ],
                                    },
                                ]}
                                onClick={handleActionMenuClick}
                            />
                        )}
                    </div>
                </div>
                {/* Body */}
                {renderList()}
                {/* Modals and Routes */}
                <Routes>
                    {ManageCategories && (
                        <Route
                            path={BASE_ROUTES.GLOBAL_CONFIG.CLUSTER_ENV.MANAGE_CATEGORIES}
                            element={<ManageCategories />}
                        />
                    )}
                    <Route
                        path="edit/:clusterId"
                        element={
                            <EditCluster
                                clusterList={clusterListResult ?? []}
                                reloadClusterList={reloadClusterList}
                                handleClose={handleRedirectToClusterList}
                            />
                        }
                    />
                    <Route
                        path={`${URLS.CREATE_ENVIRONMENT}/:clusterId?`}
                        element={
                            <AddEnvironment
                                reloadEnvironments={reloadEnvironments}
                                handleClose={handleRedirectToClusterList}
                            />
                        }
                    />
                    {/* Below route is to maintain backward compatibility and redirection from various places in dashboard */}
                    {clusterListResult && (
                        <Route
                            path={`:clusterName${URLS.CREATE_ENVIRONMENT}`}
                            element={
                                <AddEnvironmentFromClusterName
                                    clusterList={clusterListResult ?? []}
                                    reloadEnvironments={reloadEnvironments}
                                    handleClose={handleRedirectToClusterList}
                                />
                            }
                        />
                    )}
                    {PodSpreadModal && (
                        <Route
                            path={`${URLS.POD_SPREAD}/:clusterId`}
                            element={<PodSpreadModalWrapper handleClose={handleRedirectToClusterList} />}
                        />
                    )}
                    {HibernationRulesModal && (
                        <Route
                            path={`${URLS.HIBERNATION_RULES}/:clusterId`}
                            element={<HibernationRulesModalWrapper handleClose={handleRedirectToClusterList} />}
                        />
                    )}
                    <Route
                        path={`${URLS.DELETE_CLUSTER}/:clusterId`}
                        element={
                            <DeleteCluster
                                clusterList={clusterListResult ?? []}
                                reloadClusterList={reloadClusterList}
                                handleClose={handleRedirectToClusterList}
                            />
                        }
                    />
                </Routes>
            </div>
        </div>
    )
}

export default ClusterList
